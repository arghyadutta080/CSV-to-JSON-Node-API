const nodemailer = require("nodemailer");

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'xavier.nicolas@ethereal.email',
        pass: 'GcxQyDbhwdQF7wXrvc'
    }
});

const sendEmailToSubscribers = async (user, receivers, non_receivers) => {
    // const unsubscribed_proxy_url = 'http://localhost:3000/unsubscribe/${user._id}'       // clientsite proxy url
    const Unsubscribe_url = `http://localhost:5001/api/v1/unsubscribe/${user._id}`;

    try {
        const info = await transporter.sendMail({
            from: `${process.env.NODE_MAILER_SENDER_NAME} <${process.env.NODE_MAILER_SENDER_EMAIL}>`,
            to: `${user.email}`,
            subject: "Welcome to MathonGo!",
            html: `<p>Hey ${user.name}!</p><p></p><p>Thank you for signing up with your email ${user.email}. We have received your city as ${user.city}.</p><p></p><p>Team MathonGo.</p><p>If you don't want further emails, then unsubscribe from here:
                <a href="${Unsubscribe_url}" target="_blank">Unsubscribe MathOnGo</a></p>`,
        });

        receivers.push(info.accepted[0]);

    } catch (error) {
        non_receivers.push(user.email);
    }
};

module.exports = { sendEmailToSubscribers };