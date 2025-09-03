require("dotenv").config();
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI || "mongodb://localhost:27017/yourlocaldb";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('DB connected'))
  .catch(err=> console.error('DB error', err));
