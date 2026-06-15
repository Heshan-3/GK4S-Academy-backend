import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    email : {
        type : String,
        required : true,
        unique : true
    },

    profileImage: {
        type: String,
        default: ""
    }, 

    password : {
        type : String,
        required : true
    },

    firstName : {
        type : String,
        required : true
    },

    lastName : {
        type : String,
        required : true
    },

    nic : {
        type : String,
        required : true
    },

    role: {
        type: String,
        enum: ['admin', 'tutor', 'student'], // restricts possible roles
        required: true,
        default: 'student'
    },

    address : {
        type : String,
        required : true
    },

    purchasedContents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Content" 
    }],

    gotAccess : {
        type : Boolean,
        required : true,
        default : false
    },

    isBlocked : {
        type : Boolean,
        required : true,
        default : false
    }
})

const User = mongoose.model("User", userSchema)

export default User