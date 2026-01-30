import mongoose from "mongoose";
const contentSchema = new mongoose.Schema({
    tutor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    image : {
        type : String,
        required : true
    },

    title: {
        type: String,
        required: true,
    },

    videoLink: {
        type: String,
        required: true,
    },

    isPaid: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now,
    }

})

const Content = mongoose.model("Content", contentSchema);

export default Content;