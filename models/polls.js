var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll = new Schema({
    user: {type: Schema.ObjectId, ref: 'User'},
    question: String,
});

Poll
.virtual('url')
.get(function() {
    return '/poll/' + this._id;
});

module.exports = mongoose.model('Poll', Poll);