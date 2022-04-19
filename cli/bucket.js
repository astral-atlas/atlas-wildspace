// @flow strict
import { S3 } from '@aws-sdk/client-s3';
import { STS } from '@aws-sdk/client-sts';

export const handleBucketCommand = async () => {
  const s3 = new S3({ region: 'ap-southeast-2' });
  const sts = new STS({ region: 'ap-southeast-2' });
  const bucketA = 'test2-wildspace-assets-20211023083057888100000002';
  const bucketB = 'wildspace-data-mildly-kindly-diverse-seahorse';

  const { Contents } = await s3.listObjectsV2({ Bucket: bucketA });
  for (const object of Contents) {
    const uri = `${bucketA}/${object.Key}`;
    const objectHead = await s3.headObject({ Bucket: bucketA, Key: object.Key });
    console.log(object.Key, objectHead.ContentType);
    await s3.copyObject({ Bucket: bucketB, Key: object.Key, CopySource: uri, ACL: 'private' })
  }
}