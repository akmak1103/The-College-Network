const mongoose = require ('mongoose');
mongoose.set('useFindAndModify', false);
typeOfData = mongoose.Schema.Types.String;
typeOfAuthor = mongoose.Schema.Types.ObjectId;
const Post = new mongoose.Schema({
    postedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    caption:{type:String,trim:true,default:''},
    image:{type:String,},
    video:{type:String,},
    audio:{type:String,},
    likes:{type:Number,default:0},
    comments:[
        {
            author:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
            data:{type:mongoose.Schema.Types.String}
        }
    ],
},
{timestamps:true}
)

module.exports = mongoose.model('Post',Post);