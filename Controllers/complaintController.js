import mongoose from "mongoose";
import complaint from "../Models/complaint.js";

export async function addComplaint(req, res) {
  try {
    const { tutorId, questionId, description } = req.body;

    
    let validQuestionId = null;
    if (questionId && mongoose.Types.ObjectId.isValid(questionId)) {
      validQuestionId = questionId;
    }


    const newComplaint = new complaint({
      student: req.user._id,     
      tutor: tutorId,            
      question: validQuestionId, 
      description: description,
      status: 'Pending'           
    });

    await newComplaint.save();
    
    return res.status(201).json({ 
      success: true, 
      message: "Complaint submitted successfully" 
    });

  } catch (err) {
    console.error("BACKEND ERROR:", err);
    return res.status(500).json({ 
      error: "Failed to submit complaint", 
      details: err.message 
    });
  }
}

export async function getComplaints(req, res) {
  try {
    let complaints;
    

    if (req.user.role === "tutor") {
      complaints = await complaint.find({ tutor: req.user._id })
        .populate('student')
        .populate('tutor')
        .populate('question');
    } else if (req.user.role === "admin") {
      complaints = await complaint.find()
        .populate('student')
        .populate('tutor')
        .populate('question');
    } else {
      return res.status(403).json({ error: "Access denied" });
    }
    
    return res.status(200).json({ success: true, complaints });
    
  } catch (error) {
    console.error("GET COMPLAINTS ERROR:", error); 
    res.status(500).json({ error: "Failed to retrieve complaints", details: error.message });
  }
}

export async function updateComplaintStatus(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can update status" });
    }

    const { status } = req.body;
    // FIX: Update logic added
    const updated = await complaint.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Complaint not found" });
    
    return res.status(200).json({ success: true, updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update complaint status" });
  }
}

export async function deleteComplaint(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete complaints" });
    }
    
    const deleted = await complaint.findByIdAndDelete(req.params.id);
    
    if (!deleted) return res.status(404).json({ error: "Complaint not found" });

    return res.status(200).json({ success: true, message: "Complaint deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete complaint" });
  }
}