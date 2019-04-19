// load the things we need
var mongoose = require('mongoose');

// define the schema for our design model
var designSchema = mongoose.Schema({

    image: Buffer,
    userId: mongoose.Schema.Types.ObjectId,
    dateCreated: {
      type: Date, default: Date.now
    },

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Design', designSchema);
