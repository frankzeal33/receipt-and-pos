import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});
export const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Receipt and POS" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        return info;
    }
    catch (error) {
        throw error;
    }
};
