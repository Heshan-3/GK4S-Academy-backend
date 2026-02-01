// Controllers/requestController.js
import Request from "../Models/request.js";
import Content from "../Models/content.js";

export async function createAccessRequest(req, res) {
    try {
        const { contentId } = req.body;
        const content = await Content.findById(contentId);
        
        if (!content) return res.status(404).json({ error: "Content not found" });

        // Check if a request already exists
        const existingRequest = await Request.findOne({ 
            student: req.user._id, 
            content: contentId 
        });

        if (existingRequest) {
            return res.status(400).json({ error: "Request already sent" });
        }

        const newRequest = new Request({
            student: req.user._id,
            content: contentId,
            tutor: content.tutor // Pull tutor ID from the content
        });

        await newRequest.save();
        res.json({ message: "Access request sent to tutor" });
    } catch (error) {
        res.status(500).json({ error: "Request failed" });
    }
}

export async function handleRequestStatus(req, res) {
    try {
        const { requestId, status } = req.body; // status: 'approved' or 'rejected'

        const request = await Request.findById(requestId);
        if (!request) return res.status(404).json({ error: "Request not found" });

        // Security check: Is this request actually for this tutor?
        if (request.tutor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        request.status = status;
        await request.save();

        res.json({ message: `Request ${status} successfully` });
    } catch (error) {
        res.status(500).json({ error: "Update failed" });
    }
}

export async function getTutorPendingRequests(req, res) {
    try {
        // 1. Validation: Ensure only Tutors can access this list
        if (req.user.role !== 'tutor') {
            return res.status(403).json({ error: "Access denied. Only tutors can view requests." });
        }

        // 2. Database Query
        // We find requests where 'tutor' matches the logged-in ID AND status is 'pending'
        const requests = await Request.find({ 
            tutor: req.user._id, 
            status: 'pending' 
        })
        .populate("student", "firstName lastName email nic") // Get student details
        .populate("content", "title price")                // Get course details
        .sort({ createdAt: -1 });                          // Show newest requests first

        // 3. Response
        res.json({
            count: requests.length,
            requests: requests
        });

    } catch (error) {
        console.error("Error fetching tutor requests:", error);
        res.status(500).json({ error: "Failed to fetch pending requests" });
    }
}