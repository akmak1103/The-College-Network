const mongoose = require ('mongoose');
mongoose.set('useFindAndModify', false);
const User = new mongoose.Schema({
    firstName:{type:String,trim:true,default:''},
    lastName:{type:String,trim:true,default:''},
    gender:{type:String,trim:true,default:''},
    email:{type:String,trim:true,default:''},
    graduation_year:{type:Number,trim:true,default:0},
    contact_number:{type:Number,trim:true,default:0},
    college:{
        name:{type:String},
        id:{type:mongoose.Schema.Types.ObjectId,ref:'College'}
    },
    password:{type:String},
    isActive:{type:String,default:'false'},
})

module.exports = mongoose.model('User',User);