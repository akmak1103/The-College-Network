const mongoose = require ('mongoose');
mongoose.set('useFindAndModify', false);
const Token = new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId}
})

module.exports = mongoose.model('Token',Token);