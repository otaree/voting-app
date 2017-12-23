var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PollInstance = new Schema({
    user: {type: Schema.ObjectId, ref: 'User'},
    poll: {type: Schema.ObjectId, ref: 'Poll'},
    voted: {type: Boolean, default: false},
});

module.exports = mongoose.model('PollInstance', PollInstance);