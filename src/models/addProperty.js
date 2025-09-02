const mongoose = require('mongoose');

// Define Property Schema
const propertySchema = new mongoose.Schema({
    propertyType: String,
    description: String,
    location: String,
    address: String,
    price: Number,
    ownerNo: String,
    images: [String] 
});

var propertyModel = mongoose.model('property', propertySchema);
module.exports = propertyModel;