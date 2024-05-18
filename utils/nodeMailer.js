const nodemailer = require("nodemailer");

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'alyce.trantow25@ethereal.email',
        pass: '9yeQpvGnuVeudG5a5v'
    }
});

const sendEmailToSubscribers = async (user, receivers, non_receivers) => {
    try {
        const info = await transporter.sendMail({
            from: `${process.env.NODE_MAILER_SENDER_NAME} <${process.env.NODE_MAILER_SENDER_EMAIL}>`,
            to: `${user.email}`,
            subject: "Welcome to MathonGo!",
            html: `<p>Hey ${user.name}!</p><p></p><p>Thank you for signing up with your email ${user.email}. We have received your city as ${user.city}.</p><p></p><p>Team MathonGo.</p>`,
        });

        receivers.push(info.accepted[0]);

    } catch (error) {
        non_receivers.push(user.email);
    }
};

module.exports = { sendEmailToSubscribers };