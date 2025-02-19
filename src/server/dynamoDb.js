"use server"
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

if (!process.env.AWS_ACCESS_KEY || !process.env.AWS_SECRET) {
  throw new Error('AWS credentials are not properly configured');
}

const client = new DynamoDBClient({
  region: "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET
  }
});

const dynamoDb = DynamoDBDocumentClient.from(client);
export { dynamoDb };