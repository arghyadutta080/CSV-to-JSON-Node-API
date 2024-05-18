const express = require('express');
const { uploadCSV } = require('../controllers/manageUsers.js');
const upload = require('../utils/multerStorage.js');
const { sendEmail } = require('../controllers/sendEmail.js');

const manageUserRouter = express.Router()

manageUserRouter.post('/api/v1/upload', upload.single('file'), uploadCSV);
manageUserRouter.get('/api/v1/sendmail', sendEmail);

module.exports = { manageUserRouter };