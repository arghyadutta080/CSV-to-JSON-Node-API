const express = require('express');
const { uploadCSV, changeSubscribedStatus, addNewUsersManually } = require('../controllers/manageUsers.js');
const upload = require('../utils/multerStorage.js');
const { sendEmail } = require('../controllers/sendEmail.js');

const manageUserRouter = express.Router()

manageUserRouter.post('/api/v1/upload', upload.single('file'), uploadCSV);
manageUserRouter.post('/api/v1/addusers', addNewUsersManually);
manageUserRouter.get('/api/v1/sendmail', sendEmail);
manageUserRouter.put('/api/v1/unsubscribe/:id', changeSubscribedStatus);

module.exports = { manageUserRouter }; 