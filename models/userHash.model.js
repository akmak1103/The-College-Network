const mongoose = require ('mongoose');
mongoose.set('useFindAndModify', false);
const UserHash = new mongoose.Schema({
    user_id:{type:mongoose.Schema.Types.ObjectId},
    hash:{type:String},
})

module.exports = mongoose.model('UserHash',UserHash);