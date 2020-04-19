const mongoose = require ('mongoose');
const User = new mongoose.Schema({
    firstName:{type:String,trim:true,default:''},
    lastName:{type:String,trim:true,default:''},
    gender:{type:String,trim:true,default:''},
    email:{type:String,trim:true,default:''},
    graduation_year:{type:Number,trim:true,default:0},
    contact_number:{type:Number,trim:true,default:0},
    password:{type:String}
})

module.exports = mongoose.model('User',User);