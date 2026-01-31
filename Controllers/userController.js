import bcrypt from "bcrypt"
import User from "../Models/user.js"
import jwt from "jsonwebtoken"


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