// @flow strict
// flow-typed signature: b2bfca5bb6a4ae509612fd0cc8819966
// flow-typed version: <<STUB>>/@aws-sdk/client-s3_v3.34.0/flow_v0.160.2

/**
 * This is an autogenerated libdef stub for:
 *
 *   '@aws-sdk/client-s3'
 *
 * Fill this stub out by replacing all the `any` types.
 *
 * Once filled out, we encourage you to share your work with the
 * community by sending a pull request to:
 * https://github.com/flowtype/flow-typed
 */

/*::

declare module '@aws-sdk/client-dynamodb' {
  
  declare export type DynamoDBValueType =
    | {| S: string |}
    | {| N: string |}
    | {| L: DynamoDBValueType[] |}
    | {| M: {| [string]: DynamoDBValueType |} |}
    | {| BOOL: boolean |}
    | {| NULL: true |}
  
  declare export type AWSClientSharedConfig = {
    region?: string,
  }

  declare export type DynamoDBClientConfig = {
    ...AWSClientSharedConfig,
  }

  declare export type GetItemCommand = {
    Input: {
      Key: { [string]: string },
      TableName: string,
    },
    Output: {
      Item: { [string]: DynamoDBValueType }
    }
  }
  declare export type PutItemCommand = {
    Input: {
      TableName: string,
      Item: { [string]: DynamoDBValueType }
    },
    Output: {
    }
  }
  declare export type QueryItemCommand = {
    Input: {
      TableName: string,
      KeyConditionExpression: string,
      ExpressionAttributeNames?: { [string]: string },
      ExpressionAttributeValues?: { [string]: { S: string } | { N: string } | { B: string } },
    },
    Output: {
      Items: { [string]: DynamoDBValueType }[]
    }
  }
  declare export type ScanCommand = {
    Input: {
      TableName: string,
      ExclusiveStartKey?: string,
    },
    Output: {
      LastEvaluatedKey: DynamoDBValueType,
      ScannedCount: number,
      Count: number,
      Items: { [string]: DynamoDBValueType }[]
    }
  }

  declare export class DynamoDB {
    constructor(config: DynamoDBClientConfig): DynamoDB,

    getItem(input: GetItemCommand["Input"]): Promise<GetItemCommand["Output"]>,
    putItem(input: PutItemCommand["Input"]): Promise<PutItemCommand["Output"]>,
    query(input: QueryItemCommand["Input"]): Promise<QueryItemCommand["Output"]>,
    scan(input: ScanCommand["Input"]): Promise<ScanCommand["Output"]>,
  }
}

*/