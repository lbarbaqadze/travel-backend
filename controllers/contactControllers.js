import { transporter } from "../config/mailer.js";
import dbconnect from "../config/dbconnect.js";

export const sendContactMessage = async (req, res) => {
    const { name, email, subject, message } = req.body

    try {

        await dbconnect.execute(
            'INSERT INTO contact_messages (sender_name, sender_email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject, message]
        );

        const mailOptions = {
            from: `"${name}" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `New Contact ${subject}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #333;">New Message from ${name}</h2>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Message:</strong></p>
                    <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #3b82f6;">
                    ${message}</div>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions)
        res.status(200).json({ success: true, message: "Message sent successfully!" })
    } catch (error) {
        console.error("Email Error:", error);
        res.status(500).json({ success: false, message: "Failed to send message." });
    }
}