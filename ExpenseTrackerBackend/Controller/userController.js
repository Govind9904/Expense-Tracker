const User = require('../Models/User');
const {hashPassword} = require('../Models/hashPassword');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



exports.register = async (req, res) => {
    try {
        const { first_name, last_name, email, phone ,address ,password , confirm_password } = req.body;

        // Check password match
        if (password !== confirm_password) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        //  Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }


         const hashedPassword = await hashPassword(password);

        // 5. Save user
        const newUser = await User.create({
            first_name,
            last_name,
            email,
            phone,
            address,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: newUser
        });
    
    }catch(err){
        console.log(err);
        return res.status(500).json({ error : "Server Error"});
    }
};


exports.login = async (req,res) =>{
    console.log('ug', process.env.JWT_SECRET);
    try{
        const { email , password } = req.body;
       
        const user = await User.findOne( {where : {email}} );

        if(!user) return res.status(400).json({ msg:"User not Found" });

        const isMatch = await bcrypt.compare(password , user.password);

         if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

         const token = jwt.sign(
            { id : user.id , email : user.email },
            process.env.JWT_SECRET,
            {expiresIn : "1h"}
         );

         res.json({ msg: "Login successful", token });


    }catch(err){
         res.status(500).json({ error: err.message });
    }
}

//  Logout User
let blacklistedTokens = [];

exports.logut = async (req,res) => {
    try{
      const token = req.header('Authorization').replace('Bearer ', '');
      blacklistedTokens.push(token);
      res.status(200).json({ msg: "Logout successful" });   
    }catch(err){
      res.status(500).json({ error: err.message });
    }   
}