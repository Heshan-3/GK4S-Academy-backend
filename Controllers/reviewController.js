import Review from "../Models/review.js";
import Content from "../Models/content.js";

export async function addReview(req, res) {
    try {
        if (!req.user || req.user.role !== "student") {
            return res.status(403).json({ error: "Only students can add reviews" });
        }

        const { contentId, rating, comment } = req.body;

        if (!contentId || !rating || !comment) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }

        const content = await Content.findById(contentId);
        if (!content) {
            return res.status(404).json({ error: "Content not found" });
        }

        // prevent duplicate review
        const alreadyReviewed = await Review.findOne({
            student: req.user._id,
            content: contentId
        });

        if (alreadyReviewed) {
            return res.status(400).json({ error: "You already reviewed this content" });
        }

        const newReview = new Review({
            student: req.user._id,
            tutor: content.tutor,
            content: contentId,
            rating,
            comment
        });

        await newReview.save();

        res.json({
            message: "Review added successfully",
            review: newReview
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}

export async function getReviews(req, res) {
    try {
        const { tutorId } = req.params;

        if (!tutorId) {
            return res.status(400).json({ error: "Tutor ID is required" });
        }

        const reviews = await Review
            .find({ tutor: tutorId })
            .populate("student", "name");

        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}

export async function deleteReview(req, res) {
    try {
        const { reviewId } = req.params;

        if (!req.user || req.user.role !== "student") {
            return res.status(403).json({ error: "Only students can delete reviews" });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        if (review.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You can only delete your own reviews" });
        }

        await Review.findByIdAndDelete(reviewId);
        res.json({ message: "Review deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}
