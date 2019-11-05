const mongoose = require('mongoose')
const UserSchema= new mongoose.Schema({
    UserID: {
        type: String,
        required: true
    } ,
    UserType: {
        type: String,
        required: true
    } ,
    Password :{
        type: String,
        required:true
    }
});

const User = mongoose.model('User',UserSchema);
module.exports = User;