var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Option = new Schema({
    poll:{
        type: Schema.ObjectId,
        ref: 'Poll'
    },
    name: String,
    vote: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Option', Option);