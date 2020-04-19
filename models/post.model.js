const mongoose = require ('mongoose');
mongoose.set('useFindAndModify', false);
typeOfData = mongoose.Schema.Types.String;
typeOfAuthor = mongoose.Schema.Types.ObjectId;
const Post = new mongoose.Schema({
    caption:{type:String,trim:true,default:''},
    image:{type:String,},
    video:{type:String,},
    audio:{type:String,},
    likes:{type:Number,default:0},
    comments:[
        {
            author:{typeOfAuthor},
            data:{typeOfData}
        }
    ],
})

module.exports = mongoose.model('Post',Post);