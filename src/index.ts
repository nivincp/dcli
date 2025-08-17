#!/usr/bin/env node

import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

// --- Parse CLI args ---
const [, , tableName, modeArg = "find", pk, sk] = process.argv;

if (!tableName || !pk) {
  printUsage();
  process.exit(1);
}

const client = new DynamoDBClient();

async function get(pk: string, sk: string) {
  const command = new GetItemCommand({
    TableName: tableName,
    Key: { pk: { S: pk }, sk: { S: sk } },
  });
  const response = await client.send(command);
  return response.Item ? unmarshall(response.Item) : null;
}

async function find(pk: string) {
  const command = new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": { S: pk } },
  });
  const response = await client.send(command);
  return (response.Items || []).map((item) => unmarshall(item));
}

async function deleteItem(pk: string, sk: string) {
  const command = new DeleteItemCommand({
    TableName: tableName,
    Key: { pk: { S: pk }, sk: { S: sk } },
  });
  return client.send(command);
}

function handleError(error: unknown): void {
  console.error("Operation failed:");

  if (error instanceof Error) {
    console.error(`${error.name}: ${error.message}`);

    const metadata = (error as any).$metadata;
    if (metadata) {
      console.error(
        JSON.stringify(
          {
            statusCode: metadata.httpStatusCode,
            requestId: metadata.requestId,
            retries: metadata.attempts,
          },
          null,
          2
        )
      );
    }
  } else {
    console.error("Unknown error:", JSON.stringify(error, null, 2));
  }

  printUsage();
  process.exit(1);
}

function printUsage(): void {
  console.log(`
Usage: dcli <tableName> <mode> <pk> [sk]

  tableName   DynamoDB table name (e.g., my-table)
  mode        One of: find, get, delete, truncate
  pk          Partition key (e.g., "users")
  sk          Sort key (only required for get/delete)

Examples:
  dcli my-table find users
  dcli my-table get users user:01ABCD...
  dcli my-table delete users user:01XYZ...
  dcli my-table truncate users
`);
}

enum Mode {
  Find = "find",
  Get = "get",
  Delete = "delete",
  Truncate = "truncate",
}

(async () => {
  try {
    const mode = modeArg as Mode;

    switch (mode) {
      case Mode.Find: {
        const rows = await find(pk);
        console.log(rows);
        break;
      }

      case Mode.Get: {
        if (!sk) throw new Error("SK is required for get");
        const row = await get(pk, sk);
        console.log(row);
        break;
      }

      case Mode.Delete: {
        if (!sk) throw new Error("SK is required for delete");
        const deleted = await deleteItem(pk, sk);
        console.log("Deleted", deleted);
        break;
      }

      case Mode.Truncate: {
        const rows = await find(pk);
        for (const row of rows) {
          await deleteItem(row.pk, row.sk);
          console.log(`Deleted ${row.sk}`);
        }
        break;
      }

      default:
        console.error("Unknown mode:", modeArg);
        process.exit(1);
    }
  } catch (error) {
    handleError(error);
  }
})();
