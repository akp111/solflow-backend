require("dotenv").config();
const mongoose = require("mongoose");
//mongoose connect
const initialiseDBConnection = 
mongoose
  .connect(
    process.env.MONGO_URL
  )
  .then(() => {
    console.log("Successfully connected to Mongo");
  })
  .catch((err) => {
    console.log(err);
    console.log("Mayday!! Mongo connection failed");
  });

module.exports = initialiseDBConnection