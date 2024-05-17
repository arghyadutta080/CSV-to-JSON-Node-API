const express = require('express');
const { uploadCSV } = require('../controllers/manageUsers.js');
const upload = require('../utils/multerStorage.js');

const manageUserRouter = express.Router()

manageUserRouter.post('/api/v1/upload', upload.single('file'), uploadCSV);

module.exports = { manageUserRouter };