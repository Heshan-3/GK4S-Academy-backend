import bcrypt from "bcrypt"
import User from "../Models/user.js"
import jwt from "jsonwebtoken"
import Content from "../Models/content.js";


export function registerUser(req, res){
    const data = req.body;

    data.password = bcrypt.hashSync(data.password, 10)

    const newUser = new User(data)

    newUser.save().then(
        ()=>{
            res.json({message : "User registration successfull, yes"})
        }
    ).catch((error)=>{
        res.status(500).json({error : "User registration failed, no"})
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

        // Find users who have these content IDs in their purchasedContents
        // Note: This assumes students have a 'purchasedContents' array field
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

        // 3. Count Unique Students
        // Finds users who have purchased at least one of this tutor's courses
        const studentCount = await User.countDocuments({
            purchasedContents: { $in: contentIds }
        });

        // 4. Rating & Reviews (Static for now, or aggregate if you have a Review model)
        // If you have a Review model, you would sum/average them here.
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
        // Find users where role is 'tutor'
        // We use .select() to only send safe, public info (no passwords!)
        const tutors = await User.find({ role: 'tutor' })
            .select("firstName lastName role address"); 

        res.json(tutors);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tutors" });
    }
}