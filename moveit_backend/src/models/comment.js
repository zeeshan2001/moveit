var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;


var CommentSchema = mongoose.Schema({
    user_id: {
        type: Schema.ObjectId,
        ref: 'user',
        required: true
    },
    username: String,
    message: String,
    reference: String
}, {strict: true, timestamps: true});


module.exports = CommentSchema;