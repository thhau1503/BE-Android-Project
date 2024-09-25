const mongoose = require('mongoose');

const amenitiesSchema = new mongoose.Schema({
    hasWifi: { type: Boolean, default: false }, //có wifi
    hasParking: { type: Boolean, default: false }, //có chỗ để xe
    hasAirConditioner: { type: Boolean, default: false }, //có máy lạnh
    hasKitchen: { type: Boolean, default: false },  //có bếp
    hasElevator: { type: Boolean, default: false }, //có thang máy
    others: [{ type: String }] 
},
{ _id: false });


module.exports = amenitiesSchema; 
