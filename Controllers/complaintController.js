import complaint from "../Models/complaint.js";

export async function addComplaint(req, res) {
    try {
        if (req.user || req.user.role !== "student") {
            return res.status(403).json({ error: "Only students can file complaints" });
        }

        const { tutorId, questionId, description } = req.body;

        const newComplaint = new complaint({
            student: req.user._id,
            tutor: tutorId,
            question: questionId,
            description
        });

        await newComplaint.save();
        res.json({ message: "Complaint submitted successfully" });
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to submit complaint" });
    }
}

export async function getComplaints(req, res) {
    try {
        let complaints;
        if (req.user.role === "tutor") {
            // Tutors see complaints against them
            complaints = await complaint.find({ tutor: req.user._id }).populate('student question');
        } else if (req.user.role === "admin") {
            // Admins see all complaints
            complaints = await complaint.find().populate('student tutor question');
        } else {
            return res.status(403).json({ error: "Access denied" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve complaints" });
    }
}

export async function updateComplaintStatus(req, res) {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Only admins can update complaint status" });
        } 
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete complaint" });
    }
}