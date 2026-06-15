import bcrypt from "bcrypt"
import User from "../Models/user.js"
import jwt from "jsonwebtoken"
import Content from "../Models/content.js";
import Request from "../Models/request.js";


export function registerUser(req, res){
    const data = req.body;

    data.password = bcrypt.hashSync(data.password, 10)

    if (req.file) {
        data.profileImage = `/uploads/users/${req.file.filename}`;
    } else {
        data.profileImage = "";
    }

    const newUser = new User(data)

    newUser.save().then(
        ()=>{
            res.json({message : "User registration successfull, yes"})
        }
    ).catch((error)=>{
        console.error("Registration Error:", error);
        res.status(500).json({
            error: error.message
        });
        })
    }

export function loginUser(req, res){
    const data = req.body

    User.findOne({
        email: data.email,
    }).then(
        (user) =>{
            if (user == null){
                res.status(404).json({error : "User not found"})
            }else{
                if(user.isBlocked){
                    res.status(403).json({error: "Your account is blocked. Plese contact the admin"})
                    return
                }
                const isPasswordCorrect = bcrypt.compareSync(data.password, user.password)

                if (isPasswordCorrect){
                    const token = jwt.sign({
                        userId : user._id,
                        firstName : user.firstName,
                        lastName : user.lastName,
                        email : user.email,
                        role : user.role
                    },process.env.SECRET_KEY)

                    res.json({
                        message : "Login Successfull",
                        token : token,
                        user : {
                            firstName : user.firstName,
                            lastName : user.lastName,
                            email : user.email,
                            role : user.role
                        }
                    })
                }

                else {
                    res.status(401).json({ error: "Login failed" });
                }
            }
        }
    )
}

export async function getAllUsers(req, res){
    if(req.user.role !== 'admin'){
        return res.status(403).json({ error: "Access denied" });
    }
    else{
        try {
            const users = await User.find();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: "Failed to retrieve users" });
        }
    }
}

export function getUser(req, res) {
	if (req.user != null) {
		res.json(req.user);
	} else {
		res.status(403).json({ error: "Unauthorized" });
	}
}

export async function getTutorStudents(req, res) {
    try {
        // Find all content owned by this tutor
        const tutorContents = await Content.find({ tutor: req.user._id });
        const contentIds = tutorContents.map(c => c._id);

        const students = await User.find({ 
            purchasedContents: { $in: contentIds } 
        }).select("name email _id");

        res.json(students);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch students" });
    }
}

export async function getTutorStats(req, res) {
    try {
        const tutorId = req.user._id;

        // 1. Get all courses created by this tutor
        const tutorContents = await Content.find({ tutor: tutorId });
        const contentIds = tutorContents.map(c => c._id);

        // 2. Count Total Courses
        const courseCount = tutorContents.length;

        const studentCount = await User.countDocuments({
            purchasedContents: { $in: contentIds }
        });


        const averageRating = 4.8; 
        const totalReviews = 132;

        res.json({
            students: studentCount,
            courses: courseCount,
            rating: averageRating,
            reviews: totalReviews
        });
    } catch (error) {
        console.error("Error fetching tutor stats:", error);
        res.status(500).json({ error: "Failed to fetch tutor stats" });
    }
}

export async function getPublicTutors(req, res) {
    try {
        const tutors = await User.aggregate([
            { $match: { role: 'tutor' } },

            // Look up courses
            {
                $lookup: {
                    from: 'contents', 
                    localField: '_id',
                    foreignField: 'tutor',
                    as: 'tutorCourses'
                }
            },

            // Look up reviews
            {
                $lookup: {
                    from: 'reviews', 
                    localField: '_id',
                    foreignField: 'tutor',
                    as: 'allReviews'
                }
            },

            {
                $project: {
                    firstName: 1,
                    lastName: 1,
                    address: 1,
                    profileImage: { $ifNull: ["$profileImage", ""] },
                    courseCount: { $size: { $ifNull: ["$tutorCourses", []] } },
                    reviewCount: { $size: { $ifNull: ["$allReviews", []] } },
                    averageRating: { 
                        $round: [
                            { $avg: { $ifNull: ["$allReviews.rating", [0]] } }, 
                            1
                        ] 
                    }
                }
            }
        ]);

        res.json(tutors);
    } catch (error) {
        // This is crucial: check your VS Code / Terminal console for this log!
        console.error("Aggregation Error Details:", error); 
        res.status(500).json({ error: error.message });
    }
}

export async function deleteUser(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Admins can delete users" });
        }

        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        await User.findByIdAndDelete(userId);
        res.json({ message: "Content deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete content" });
    }
}

export async function getAdminStats(req, res) {
  try {
    // Fetch counts in parallel
    const [studentCount, tutorCount, courseCount, totalRevenue] = await Promise.all([
      User.countDocuments({ role: "student" }), // Count Students
      User.countDocuments({ role: "tutor" }),   // Count Tutors
      Content.countDocuments(),                 // Count Courses
      // Sum price of all contents
      Content.aggregate([{ $group: { _id: null, total: { $sum: { $multiply: ["$price", 0.20] } } } }])
    ]);

    res.json({
      students: studentCount,
      tutors: tutorCount,
      courses: courseCount,
      revenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function blockOrUnblockUser(req, res) {
	const email = req.params.email;
	if (req.user.role == "admin") {
		try {
			const user = await User.findOne({
				email: email,
			});

			if (user == null) {
				res.status(404).json({ error: "User not found" });
				return;
			}

			const isBlocked = !user.isBlocked;

			await User.updateOne(
				{
					email: email,
				},
				{
					isBlocked: isBlocked,
				}
			);

			res.json({ message: "User blocked/unblocked successfully" });
		} catch (e) {
			res.status(500).json({ error: "Failed to get user" });
		}
	} else {
		res.status(403).json({ error: "Unauthorized" });
	}
}