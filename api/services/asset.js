// @flow strict
/*:: import type { AssetID, AssetDescription, APIConfig, AWSS3AssetConfig, FileAssetConfig } from '@astral-atlas/wildspace-models'; */
/*:: import type { WildspaceData } from '@astral-atlas/wildspace-data'; */
import { S3, PutObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from 'uuid';
import { join } from 'path';

/*::
export type AssetService = {
  peek: (id: AssetID) => Promise<{ downloadURL: string, description: AssetDescription }>,
  put: (MIMEType: string, bytes: number, name: string) => Promise<{ downloadURL: string, description: AssetDescription, uploadURL: string }>
};
*/

export const createFileAssetService = (data/*: WildspaceData*/, config/*: FileAssetConfig*/)/*: AssetService*/ => {
  throw new Error('unimplemented');
};

export const createS3AssetService = (data/*: WildspaceData*/, config/*: AWSS3AssetConfig*/)/*: AssetService*/ => {
  const client = new S3({ region: config.region });

  const peek = async (id) => {
    const { result: description } = await data.assets.get(id);
    if (!description)
      throw new Error();
    const key = join(config.keyPrefix, description.id);
    const downloadURL = `https://${config.bucket}.s3.amazonaws.com/${key}`;
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
    const key = join(config.keyPrefix, description.id);
    const command = new PutObjectCommand({
      Key: key,
      Bucket: config.bucket,
      ContentType: MIMEType,
      ContentLength: bytes,
      ACL: 'public-read'
    });
    await data.assets.set(description.id, description);
    const uploadURL = await getSignedUrl(client, command);
    const downloadURL = `https://${config.bucket}.s3.amazonaws.com/${key}`;

    return { description, uploadURL, downloadURL };
  };
  return { peek, put };
};

export const createMemoryAssetService = (data/*: WildspaceData*/)/*: AssetService*/ => {
  const peek = async (id) => {
    const { result: description } = await data.assets.get(id);
    if (!description)
      throw new Error();
    
    return {
      description,
      downloadURL: `http://localhost:5567/assets/data?assetId=${id}`,
    }
  };
  const put = async (MIMEType, bytes, name) => {
    const description = {
      MIMEType, bytes, creator: '', id: uuid(), name, uploaded: Date.now()
    };
    await data.assets.set(description.id, description);
    return {
      downloadURL: `http://localhost:5567/assets/data?assetId=${description.id}`,
      description,
      uploadURL: `http://localhost:5567/assets/data?assetId=${description.id}`,
    }
  };
  return { peek, put };
};

export const createAssetService = (data/*: WildspaceData*/, config/*: APIConfig*/)/*: AssetService*/ => {
  switch (config.asset.type) {
    case 'memory':
      return createMemoryAssetService(data);
    case 'awsS3':
      return createS3AssetService(data, config.asset);
    case 'file':
      return createFileAssetService(data, config.asset);
  }
};