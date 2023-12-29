const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI; // Connection string from MongoDB Atlas.
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//connects to database and returns database object
const mongoDAO = (() => { 
  let db;

  const connect = async () => {
    await client.connect();
    db = client.db(process.env.MONGODB_DBNAME);
    console.log('Connected to MongoDB');
  };

  const getDb = () => {
    if (!db) {
      throw new Error('No database connection');
    }
    return db;
  };

  return {
    connect,
    getDb,
  };
})();

module.exports = mongoDAO;
