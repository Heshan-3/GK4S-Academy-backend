import mongoose from "mongoose";

const materialSchema = new mongoose.Schema({
    tutor : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },

    title : {
        type : String,
        required : true
    },

    fileUrl : {
        type : String,
        required : true
    },

    createdAt : {
        type : Date,
        default : Date.now(),
    }
})

const Material = mongoose.model("Material", materialSchema);
export default Material;