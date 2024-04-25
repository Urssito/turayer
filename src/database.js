const mongo = require("mongoose");

const mongoClient = mongo.connect(process.env.MONGO_DB)
  .then(db => {
    console.log("DB connected in: ", process.env.MONGO_DB);
    db.connection.getClient();
    return db.connections[0]._connectionString
  })
  .catch(err => {console.log(err)});

module.exports = mongoClient;