const mongoose = require('mongoose'),
    crypto = require('crypto');

const athSchema = new mongoose.Schema({
    name: String,
    dob: String, //I could store this as a Date, but there is some weird behavior with dates and mongoose. So I'm storing this as a String. This also prevents time zone issues;
    createDate: {type:Number,default:Date.now()}, //same as above
    nationality: { type: String, default: 'us' },
    association: String,
    team: String,
    gender: Number, //0 male, 1 female, 2 other
    sports: [String],
    about: String, //long paragraph, biography type stuff
    interests: [String],
    charities: [String],
    facebook: { type: String, default: null },
    twitter: { type: String, default: null },
    instagram: { type: String, default: null },
    youtube: { type: String, default: null },
    twitch: { type: String, default: null },
    snapchat: { type: String, default: null },
    pets:[{name:String,species:String}],
    alcohol:Boolean,
    married:Number,
    profileImage:String//base64 img
}, { collection: 'Ath' });


const Ath = mongoose.model('Ath', athSchema);
module.exports = Ath;