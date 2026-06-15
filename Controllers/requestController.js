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

export const handleRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params; //Change from req.body to req.params
    const { status } = req.body;      // 'approved' or 'rejected'

    const request = await Request.findByIdAndUpdate(
      requestId, 
      { status: status }, 
      { new: true }
    );
    
    // ... rest of your logic (adding content to student's list, etc.)
    res.status(200).json({ message: `Request ${status}`, request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export async function getTutorPendingRequests(req, res) {
    try {
        // 1. Validation: Ensure only Tutors can access this list
        if (req.user.role !== 'tutor') {
            return res.status(403).json({ error: "Access denied. Only tutors can view requests." });
        }

    
        const requests = await Request.find({ 
            tutor: req.user._id, 
            status: 'pending' 
        })
        .populate("student", "firstName lastName email nic")
        .populate("content", "title price")              
        .sort({ createdAt: -1 });                         

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