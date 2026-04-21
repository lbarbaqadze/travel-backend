import bcrypt from "bcrypt"
import dbconnect from "../config/dbconnect.js"
import jwt from "jsonwebtoken"
import { transporter } from '../config/mailer.js';

export const Register = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "Enter data" })
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: "The password must be at least 8 characters long and contain an uppercase letter, a number, and the symbol [!@#$]"
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const vCode = Math.floor(100000 + Math.random() * 900000).toString();

        const sql = 'INSERT INTO users (name, surname, email, password, verification_code, is_verified) VALUES (?, ?, ?, ?, ?, 0)';
        await dbconnect.execute(sql, [firstName, lastName, email, hashedPassword, vCode]);

        const mailOptions = {
            from: '"Travel Agency Georgia 🇬🇪" <travelagencyinfo21@gmail.com>',
            to: email,
            subject: 'Verification Code',
            html: `
                <div style="text-align: center; font-family: sans-serif; border: 1px solid #eee; padding: 20px;">
                    <h2 style="color: #333;">Welcome!</h2>
                    <p>Use the code to complete your registration:</p>
                    <h1 style="color: #4A90E2; letter-spacing: 5px;">${vCode}</h1>
                    <p style="font-size: 12px; color: #888;">If this wasn't you, just ignore this message.</p>
                </div>
            `
        };

        transporter.sendMail(mailOptions).catch(err => console.error("Email error:", err));

        res.status(201).json({ message: "The code has been sent to your email, please confirm" });

    } catch (err) {
        console.log(err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "There is already a profile at this email address" });
        }
        res.status(500).json({ message: "Server error", err });
    }
}

export const VerifyEmail = async (req, res) => {
    const { email, code } = req.body;

    try {
        const [rows] = await dbconnect.execute(
            'SELECT * FROM users WHERE email = ? AND verification_code = ?', 
            [email, code]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: "Invalid code or email" });
        }

        await dbconnect.execute(
            'UPDATE users SET is_verified = 1, verification_code = NULL WHERE email = ?', 
            [email]
        );

        res.status(200).json({ message: "Verification completed successfully!" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error during verification" });
    }
};

export const Login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: "Enter data" })
    }

    try {
        const sql = "SELECT * FROM users WHERE email = ?"
        const [rows] = await dbconnect.execute(sql, [email])

        if (rows.length === 0) {
            return res.status(402).json({ message: "Incorrect email or password" })
        }

        const user = rows[0]

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password" })
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.status(200).json({
            message: "You have successfully authenticated",
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role}
        })

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "An error occurred" })
    }
}

export const googleSync = async (req, res) => {
    const { email, name, image } = req.body;

    try {
        let user;
        const [existingUser] = await dbconnect.query("SELECT * FROM users WHERE email = ?", [email]);

        if (existingUser.length > 0) {
            user = existingUser[0];
        } else {
            const [result] = await dbconnect.query(
                "INSERT INTO users (name, email, password, profile_image, role) VALUES (?, ?, ?, ?, ?)",
                [name, email, null, image, 'user']
            );
            user = {
                id: result.insertId,
                name: name,
                email: email,
                profile_image: image,
                role: 'user'
            };
        }

        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Success",
            token, 
            user
        });

    } catch (error) {
        console.error("Google Sync Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const ForgotPassword = async (req, res) => {
    const {email} = req.body

    try{

        const [user] = await dbconnect.execute(`SELECT * FROM users WHERE email = ?`, [email])

        if(user.length === 0){
            return res.status(404).json({message: "User with this email does not exist."})
        }

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        await dbconnect.execute('UPDATE users SET verification_code = ? WHERE email = ?', [resetCode, email])

        const mailOptions = {
            from: '"Travel Agency Georgia 🇬🇪" <travelagencyinfo21@gmail.com>',
            to: email,
            subject: 'Password recovery',
            html: `<h3>Your password recovery code is: ${resetCode}</h3>`
        };

        transporter.sendMail(mailOptions);
        
        res.status(200).json({message: "Recovery code sent to email"})
    }catch(err){
        res.status(500).json({message: "Server error"})
    }
}

export const ResetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;

    try {
        const [user] = await dbconnect.execute(
            'SELECT * FROM users WHERE email = ? AND verification_code = ?', 
            [email, code]
        );

        if (user.length === 0) {
            return res.status(400).json({ message: "Invalid Code" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await dbconnect.execute(
            'UPDATE users SET password = ?, verification_code = NULL WHERE email = ?', 
            [hashedPassword, email]
        );

        res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};