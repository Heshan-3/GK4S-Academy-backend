import Content from "../Models/content.js";
import Review from "../Models/review.js";

export async function addContent(req, res) {
    try {
        // 1. Check Role
        if (req.user.role !== "tutor") {
            return res.status(403).json({ error: "Only tutors can add content" });
        }

        // 2. Check if file was actually uploaded
        if (!req.file) {
            return res.status(400).json({ error: "Please upload a thumbnail image." });
        }

        const { title, videoLink, isPaid, price, description } = req.body;

        // 3. Create document (Convert strings from FormData to correct types)
        const newContent = new Content({
            tutor: req.user._id,
            title,
            videoLink,
            description,
            image: req.file.path, // Path from your multer config
            isPaid: isPaid === "true", // FormData sends strings
            price: isPaid === "true" ? Number(price) : 0,
        });

        await newContent.save();
        res.status(201).json({ message: "Content added successfully" });

    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: "Internal Server Error: " + error.message });
    }
}

export async function getContents(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // STUDENT
        if (req.user.role === "student") {
            const contents = await Content.find({
                $or: [
                    { isPaid: false },
                    { _id: { $in: req.user.purchasedContents || [] } }
                ]
            });
            return res.json(contents);
        }

        // TUTOR
        if (req.user.role === "tutor") {
            const contents = await Content.find({ tutor: req.user._id }).populate("tutor", "firstName lastName");
            return res.json(contents);
        }

        // ADMIN
        if (req.user.role === "admin") {
            const contents = await Content.find().populate("tutor", "firstName lastName");
            return res.json(contents);
        }

        return res.status(403).json({ error: "Access denied" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve contents" });
    }
}


export async function deleteContent(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (req.user.role !== "tutor" && req.user.role !== "admin") {
            return res.status(403).json({ error: "Tutors or admins can delete content" });
        }

        const contentId = req.params.id;
        const content = await Content.findById(contentId);

        if (!content) {
            return res.status(404).json({ error: "Content not found" });
        }

        // Tutors can delete only their content
        if (
            req.user.role === "tutor" &&
            content.tutor.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ error: "You can only delete your own content" });
        }

        await Content.findByIdAndDelete(contentId);
        res.json({ message: "Content deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete content" });
    }
}

export async function updateContent(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (req.user.role !== "tutor") {
            return res.status(403).json({ error: "Only tutors can update content" });
        }

        const contentId = req.params.id;
        const content = await Content.findById(contentId);

        if (!content) {
            return res.status(404).json({ error: "Content not found" });
        }

        // Tutors can only update their own content
        if (content.tutor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You can only update your own content" });
        }

        // 1. Destructure all fields sent from the frontend FormData
        const { title, videoLink, isPaid, price, description } = req.body;

        // 2. Prepare the update object
        const updateData = {
            title,
            videoLink,
            description,
            // Convert strings from FormData to correct types
            isPaid: isPaid === "true", 
            price: isPaid === "true" ? Number(price) : 0,
        };

        // 3. If a new image was uploaded via Multer, update the image path
        if (req.file) {
            updateData.image = req.file.path; 
        }

        // 4. Update the document in MongoDB
        await Content.findByIdAndUpdate(contentId, { $set: updateData });

        res.json({ message: "Content updated successfully" });
    } catch (error) {
        console.error("Update Controller Error:", error);
        res.status(500).json({ error: "Failed to update content: " + error.message });
    }
}

export const getFeaturedContents = async (req, res) => {
  try {
    const contents = await Content.find() 
      .populate("tutor", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(4);

    const contentsWithStats = await Promise.all(
      contents.map(async (content) => {
        const reviews = await Review.find({ tutor: content.tutor?._id });

        const avgRating =
          reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

        return {
          ...content._doc,
          avgRating,
          totalStudents: 0, 
        };
      })
    );

    res.json(contentsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export async function getPublicContents(req, res) {
  try {
    const contents = await Content.find({ isPaid: false })
      .populate("tutor", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json(contents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch public contents" });
  }
}

export async function getTutorContents(req, res) {
    try {
        // Ensure the user is logged in and is a tutor
        if (!req.user || req.user.role !== 'tutor') {
            return res.status(403).json({ error: "Access denied" });
        }

        const contents = await Content.find({ tutor: req.user._id });
        
        res.json(contents);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch your courses" });
    }
}


export async function getAllPublicContents(req, res) {
  try {
    const contents = await Content.find()
      .populate("tutor", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json(contents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contents" });
  }
}

