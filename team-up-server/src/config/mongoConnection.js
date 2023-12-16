import { MongoClient } from "mongodb";
require('dotenv').config();

let _connection = undefined;
let _db = undefined;
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;
const cluster = process.env.MONGODB_CLUSTER;
const url = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/?retryWrites=true&w=majority`

module.exports = {
  dbConnection: async () => {
    if (!_connection) {
      _connection = await MongoClient.connect(url);
      _db = await _connection.db(process.env.DB_NAME);
    }
    console.log("Connected :)");

    return _db;
  },
  closeConnection: () => {
    _connection.close();
  },
};
