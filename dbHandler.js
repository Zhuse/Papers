
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MONGODB_URL } = process.env;

let mongoServer;
/**
 * Connect to the database.
 */
module.exports.connect = async () => {
  let uri = MONGODB_URL
  if (process.env.NODE_ENV === 'test') {
    mongoServer = await MongoMemoryServer.create();
    uri = mongoServer.getUri()
  }
  await mongoose.connect(uri)
}

/**
 * Drop database, close the connection and stop mongod.
 */
module.exports.closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer)
    await mongoServer.stop();
}

/**
 * Remove all the data for all db collections.
 */
module.exports.clearDatabase = async () => {
  const collections = mongoose.connections.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
}