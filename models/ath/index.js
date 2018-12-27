const mongoose = require('mongoose'),
    crypto = require('crypto'),
    passportLocalMongoose = require('passport-local-mongoose');

const usrSchema = new mongoose.Schema({
    
}, { collection: 'User' });


const generateSalt = function() {
        return crypto.randomBytes(16).toString('base64');
    },
    encryptPassword = function(plainText, salt) {
        // console.log('PASSWORD', plainText, salt)
        var hash = crypto.createHash('sha1');
        hash.update(plainText);
        hash.update(salt);
        return hash.digest('hex');
    };
usrSchema.statics.generateSalt = generateSalt;
usrSchema.statics.encryptPassword = encryptPassword;
usrSchema.methods.correctPassword = function(candidatePassword) {
    console.log('slt', this.salt, 'and their pwd:', this.pass)
    return encryptPassword(candidatePassword, this.salt) === this.pass;
};

const User = mongoose.model('User', usrSchema);
module.exports = User;