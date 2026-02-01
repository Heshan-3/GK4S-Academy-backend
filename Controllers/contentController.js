import Content from "../Models/content.js";
import Review from "../Models/review.js";

export async function addContent(req, res) {
    try {
        // Only tutors can add content
        if (req.user.role !== "tutor") {
            return res.status(403).json({ error: "Only tutors can add content" });
        }

        const { title, videoLink, isPaid } = req.body;

        const newContent = new Content({
            tutor: req.user._id, // use logged-in tutor's ID
            videoLink,
            isPaid: isPaid || false,
            price: req.body.price || 0,
            description: req.body.description,
            title : title
        });

        await newContent.save();
        res.json({ message: "Content added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add content" });
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
        if (content.tutor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You can only update your own content" });
        }

        const { title, videoLink, isPaid } = req.body;
        await Content.findByIdAndUpdate(contentId, { title, videoLink, isPaid });

        res.json({ message: "Content updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update content" });
    }
}

export const getFeaturedContents = async (req, res) => {
  try {
    const contents = await Content.find() // Fetches ALL (Paid + Free)
      .populate("tutor", "firstName lastName") // 🔥 Changed from 'name' to match your model
      .sort({ createdAt: -1 });

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