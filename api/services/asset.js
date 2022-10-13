// @flow strict
/*:: import type {
  AssetID, AssetDescription,
  APIConfig, AssetConfig,
  AWSS3AssetConfig, AssetInfo
} from '@astral-atlas/wildspace-models'; */
/*:: import type { WildspaceData } from '@astral-atlas/wildspace-data'; */
import { S3, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from 'uuid';
import { join } from 'path';
import { Readable } from "stream";

/*::
export type AssetService = {
  peek: (id: AssetID) => Promise<?AssetInfo>,
  batchPeek: (ids: $ReadOnlyArray<?AssetID>) => Promise<AssetInfo[]>,
  put: (MIMEType: string, bytes: number, name: string) => Promise<{ downloadURL: string, description: AssetDescription, uploadURL: string }>,

  getAssetDataStream: AssetID => Promise<{ stream: stream$Readable, type: string, length: number }>
};
*/

export const createS3AssetService = (data/*: WildspaceData*/, config/*: AWSS3AssetConfig*/)/*: AssetService*/ => {
  const client = new S3({ region: config.region });
  const urlConfig = config.url || { type: 'awsS3' };

  const calculateS3DownloadURL = async (key) => {
    const { result } = await data.assetLinkCache.get(key, Date.now());
    if (result) {
      return result.downloadURL;
    }

    const getObject = new GetObjectCommand({
      Key: key,
      Bucket: config.bucket,
    });
    const durationSeconds = 60 * 60 * 3;
    const downloadURL = await getSignedUrl(client, getObject, { expiresIn: durationSeconds })
    await data.assetLinkCache.set(key, { downloadURL }, (durationSeconds * 1000) + Date.now())

    return downloadURL;
  }

  const calculateDownloadURL = async (key, id) => {
    switch (urlConfig.type) {
      case 'awsS3':
        return await calculateS3DownloadURL(key);
      case 'api':
        return `${urlConfig.host}/assets/data?assetId=${id}`;
    }
  };

  const peek = async (id)/*: Promise<?AssetInfo>*/ => {
    const { result: description } = await data.assets.get(id);
    if (!description)
      return null
    const key = join(config.keyPrefix, description.id);
    const downloadURL = await calculateDownloadURL(key, id);

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
    const downloadURL = await calculateDownloadURL(key, description.id);

    return { description, uploadURL, downloadURL };
  };
  const batchPeek = async (ids)/*: Promise<AssetInfo[]>*/ => {
    return Promise.all(ids.filter(Boolean).map(peek))
      .then(assetInfos =>  assetInfos.filter(Boolean))
  }
  const getAssetDataStream = async (assetId) => {
    const key = join(config.keyPrefix, assetId);
    const input = {
      Key: key,
      Bucket: config.bucket,
    };
    const { Body, ContentLength, ContentType } = await client.getObject(input);
    return {
      type: ContentType,
      length: parseInt(ContentLength, 10),
      stream: Body,
    }
  }

  return { peek, put, batchPeek, getAssetDataStream };
};

export const createLocalAssetService = (data/*: WildspaceData*/, config/*: AssetConfig*/)/*: AssetService*/ => {
  const peek = async (id)/*: Promise<?AssetInfo>*/ => {
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
  const batchPeek = async (ids) => {
    return Promise.all(ids.filter(Boolean).map(peek)).then(assetInfos =>  assetInfos.filter(Boolean))
  }
  const getAssetDataStream = async (assetId) => {
    const { result: buffer } = await data.assetData.get(assetId);
    const { result: description } = await data.assets.get(assetId);
    if (!buffer || !description)
      throw new Error();
    const stream = Readable.from(buffer);
    return { stream, length: buffer.byteLength, type: description.MIMEType }
  }
  return { peek, put, batchPeek, getAssetDataStream };
};

export const createAssetService = (data/*: WildspaceData*/, config/*: APIConfig*/)/*: AssetService*/ => {
  switch (config.asset.type) {
    case 'local':
      return createLocalAssetService(data, config.asset);
    case 'awsS3':
      return createS3AssetService(data, config.asset);
    default:
      throw new Error();
  }
};