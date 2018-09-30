var autoIncrement = require('mongoose-auto-increment');
var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://user:user123@ds119343.mlab.com:19343/shopping-rec');

var Schema = mongoose.Schema;
autoIncrement.initialize(db);


var face = new Schema({
    'timestamp': { type: Date, default: Date.now },
    'id':String,
    'attributes': {
        "lips": String,
        "asian": Number,
        "gender": {
            "tipo": String,
        },
        "age": Number,
        "hispanic": Number,
        "other": Number,
        "black": Number,
        "white": Number,
        "glasses": String
    },
    'logs':[{
        'check': { type: Date, default: Date.now },
        'location': String
    }]
});
face.plugin(autoIncrement.plugin, 'Face');

module.exports = db.model('Face', face);