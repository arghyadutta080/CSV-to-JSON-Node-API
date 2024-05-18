const asyncError = require("../middlewares/asyncError");
const UserData = require("../models/userDataModel");
const { ErrorHandler } = require("../utils/customError");
const { sendEmailToSubscribers } = require("../utils/nodeMailer");


const sendEmail = asyncError(async (req, res, next) => {
    const subscribers = await UserData.find({ subscribed: true });

    if (subscribers.length === 0) return next(new ErrorHandler("No subscribed users found", 404));

    const receivers = [], non_receivers = [];

    const emailPromises = subscribers.map(async (user) => {
        await sendEmailToSubscribers(user, receivers, non_receivers);
    });

    await Promise.all(emailPromises);       // waiting until all mails are sent

    res.status(200).json({
        success: true,
        message: "Email sent!",
        total_subscribers: subscribers.length,
        received_by: receivers,
        not_received_by: non_receivers
    });
})

module.exports = { sendEmail };