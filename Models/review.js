import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    student : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },

    tutor : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },

    rating : {
        type : Number,
        required : true,
        min : 1,
        max : 5
    },
    
    comment : {
        type : String,
        required : false
    },

    createdAt : {
        type : Date,
        default : Date.now(),
    }
})

const Review = mongoose.model("Review", reviewSchema);
export default Review;