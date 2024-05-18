const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    tls: {
        ciphers: "SSLv3",
    },
    port: 465,
    secure: true,
    auth: {
        user: process.env.NODE_MAILER_SENDER_EMAIL,
        pass: process.env.NODE_MAILER_SENDER_PASSWORD,
    },
});

const sendEmailToSubscribers = async (user, receivers, non_receivers) => {
    // const unsubscribed_proxy_url = 'http://localhost:3000/unsubscribe/${user._id}'       // clientsite proxy url
    const Unsubscribe_url = `http://localhost:5001/api/v1/unsubscribe/${user._id}`;

    const options = {
        from: {
            name: process.env.NODE_MAILER_SENDER_NAME,
            address: process.env.NODE_MAILER_SENDER_EMAIL
        },
        to: `${user.email}`,
        subject: "Welcome to MathonGo!",
        html: `<p>Hey ${user.name}!</p><p></p><p>Thank you for signing up with your email ${user.email}. We have received your city as ${user.city}.</p><p></p><p>Team MathonGo.</p><p>If you don't want further emails, then unsubscribe from here:
                <a href="${Unsubscribe_url}" target="_blank">Unsubscribe MathOnGo</a></p>`,
    }
    try {
        const info = await transporter.sendMail(options);
        receivers.push(info.accepted[0]);
        console.log('info: ', info);
    } catch (error) {
        non_receivers.push(user.email);
        console.log({ error });
    }
};

module.exports = { sendEmailToSubscribers };