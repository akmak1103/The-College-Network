const mongoose = require ('mongoose');
mongoose.set('useFindAndModify', false);
const College = new mongoose.Schema({
    name:{type:String},
    students:[mongoose.Schema.Types.ObjectId],
})

module.exports = mongoose.model('College',College);