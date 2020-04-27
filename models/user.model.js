const mongoose = require ('mongoose');
mongoose.set('useFindAndModify', false);
const User = new mongoose.Schema({
    name:{type:String,trim:true,default:''},
    gender:{type:String,trim:true,default:''},
    email:{type:String,trim:true,default:''},
    graduation_year:{type:Number,trim:true,default:0},
    contact_number:{type:Number,trim:true,default:0},
    college_name:{type:String},
    password:{type:String},
    isActive:{type:Boolean,default:false},
    savedPosts:[{type:mongoose.Schema.Types.ObjectId,ref:'Post'}],
    interests:[{type:String}]
})

module.exports = mongoose.model('User',User);