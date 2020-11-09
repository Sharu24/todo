const mongoose = require("mongoose");
const config = require("./config");
const connectDb = async () => {
  try {
    await mongoose.connect(config.mongoUri, config.options);
    console.log("Successfully Connected to Mongo DB");
  } catch (err) {
    console.log("Unable to Connect to Mongo DB");
  }
};

connectDb();
