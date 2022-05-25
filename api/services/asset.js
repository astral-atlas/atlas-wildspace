// @flow strict
/*:: import type { AssetID, AssetDescription, APIConfig, AWSS3AssetConfig } from '@astral-atlas/wildspace-models'; */
/*:: import type { WildspaceData } from '@astral-atlas/wildspace-data'; */
import { S3, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from 'uuid';
import { join } from 'path';

/*::
export type AssetService = {
  peek: (id: AssetID) => Promise<?{ downloadURL: string, description: AssetDescription }>,
  put: (MIMEType: string, bytes: number, name: string) => Promise<{ downloadURL: string, description: AssetDescription, uploadURL: string }>
};
*/

export const createS3AssetService = (data/*: WildspaceData*/, config/*: AWSS3AssetConfig*/)/*: AssetService*/ => {
  const client = new S3({ region: config.region });

  const calculateDownloadURL = async (key) => {
    const { result } = await data.assetLinkCache.get(key, Date.now());
    if (result) {
      //return result.downloadURL;
    }

    const getObject = new GetObjectCommand({
      Key: key,
      Bucket: config.bucket,
    });
    const durationSeconds = 60 * 60 * 24;
    const downloadURL = await getSignedUrl(client, getObject, { expiresIn: durationSeconds, ExpiresIn: durationSeconds })
    await data.assetLinkCache.set(key, { downloadURL }, (durationSeconds * 1000) + Date.now())

    return downloadURL;
  };

  const peek = async (id) => {
    const { result: description } = await data.assets.get(id);
    if (!description)
      return null
    const key = join(config.keyPrefix, description.id);
    const downloadURL = await calculateDownloadURL(key);

    return { description, downloadURL };
  };
  const put = async (MIMEType, bytes, name) => {
    const description = {
      id: uuid(),
      name,
      bytes,
      MIMEType,
      creator: '',
      uploaded: Date.now(),
    };
    const key = [config.keyPrefix, description.id].join('/');
    const putObject = new PutObjectCommand({
      Key: key,
      Bucket: config.bucket,
      ContentType: MIMEType,
      ContentLength: bytes,
    });
    await data.assets.set(description.id, description);
    const uploadURL = await getSignedUrl(client, putObject, { expiresIn: 600 });
    const downloadURL = await calculateDownloadURL(key);

    return { description, uploadURL, downloadURL };
  };
  return { peek, put };
};

export const createLocalAssetService = (data/*: WildspaceData*/)/*: AssetService*/ => {
  const peek = async (id) => {
    const { result: description } = await data.assets.get(id);
    if (!description)
      return null;
    
    return {
      description,
      downloadURL: `http://127.0.0.1:5567/assets/data?assetId=${description.id}`,
    }
  };
  const put = async (MIMEType, bytes, name) => {
    const description = {
      MIMEType, bytes, creator: '', id: uuid(), name, uploaded: Date.now()
    };
    await data.assets.set(description.id, description);
    return {
      downloadURL: `http://127.0.0.1:5567/assets/data?assetId=${description.id}`,
      description,
      uploadURL: `http://127.0.0.1:5567/assets/data?assetId=${description.id}`,
    }
  };
  return { peek, put };
};

export const createAssetService = (data/*: WildspaceData*/, config/*: APIConfig*/)/*: AssetService*/ => {
  switch (config.asset.type) {
    case 'local':
      return createLocalAssetService(data);
    case 'awsS3':
      return createS3AssetService(data, config.asset);
    default:
      throw new Error();
  }
};