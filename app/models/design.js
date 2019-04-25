// load the things we need
var mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

// define the schema for our design model
var designSchema = mongoose.Schema({
    filename: {type: String, default: uuidv4() },
    image: Buffer,
    userId: mongoose.Schema.Types.ObjectId,
    dateCreated: {
      type: Date, default: Date.now
    },

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Design', designSchema);
