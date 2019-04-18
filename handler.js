import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export const hello = async (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: `Go Serverless v1.0! ${(await message({ time: 1, copy: 'Your function executed successfully!'}))}`,
    }),
  };

  callback(null, response);
};

export const temperature = async (event, context, callback) => {
  const params = {
    TableName: "lindheim_temperature",
    // 'KeyConditionExpression' defines the condition for the query
    // - 'userId = :userId': only return items with matching 'userId'
    //   partition key
    // 'ExpressionAttributeValues' defines the value in the condition
    // - ':userId': defines 'userId' to be Identity Pool identity id
    //   of the authenticated user
    KeyConditionExpression: "sensorId = :sensorId",
    ExpressionAttributeValues: {
      ":sensorId": 1
    },
    ScanIndexForward: false,
    Limit: 1
  };

  try {
    const result = await dynamoDbLib.call("query", params);
    // Return the matching list of items in response body
    return success(result.Items);
  } catch (e) {
    console.log(e);
    return failure({ status: false });
  }
};

export const today = async (event, context, callback) => {
  let todayString = new Date().toISOString().slice(0, 10)
  const params = {
    TableName: "lindheim_temperature",
    // 'KeyConditionExpression' defines the condition for the query
    // - 'userId = :userId': only return items with matching 'userId'
    //   partition key
    // 'ExpressionAttributeValues' defines the value in the condition
    // - ':userId': defines 'userId' to be Identity Pool identity id
    //   of the authenticated user
    KeyConditionExpression: "sensorId = :sensorId AND #DocTimestamp between :start AND :end",
    ExpressionAttributeNames: {
      '#DocTimestamp': 'timestamp'
    },
    ExpressionAttributeValues: {
      ":sensorId": 1,
      ":start": todayString + "T00:00:00",
      ":end": todayString + "T23:59:00"
    },
    Limit: 500
  };

  try {
    const result = await dynamoDbLib.call("query", params);
    // Return the matching list of items in response body
    return success(result.Items);
  } catch (e) {
    console.log(e);
    return failure({ status: false });
  }
};


const message = ({ time, ...rest }) => new Promise((resolve, reject) => 
  setTimeout(() => {
    resolve(`${rest.copy} (with a delay)`);
  }, time * 1000)
);
