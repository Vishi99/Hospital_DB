const mongoose = require('mongoose')
const reviewSchema= new mongoose.Schema({
    
    patient_id: {
        type: String,
        required: true
    } ,
    review :{
        type: String,
        required: true
    }
});

const review = mongoose.model('review', reviewSchema);
module.exports = review;