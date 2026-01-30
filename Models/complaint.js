import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
    student :{ type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    tutor :{ type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
    question :{ type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    description :{ type: String, required: true },
    status :{ type: String, enum: ['Pending', 'In Review', 'Resolved'], default: 'Pending' },
    createdAt :{ type: Date, default: Date.now },
    updatedAt :{ type: Date, default: Date.now }
});

export default mongoose.model('Complaint', complaintSchema);