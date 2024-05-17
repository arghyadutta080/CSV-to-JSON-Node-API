const csv = require('csvtojson');
const UserData = require('../models/userDataModel.js');
const asyncError = require('../middlewares/asyncError.js');
const { ErrorHandler } = require('../utils/customError.js');


const uploadCSV = asyncError(async (req, res, next) => {
    const jsonObj = await csv().fromFile(req.file.path);    // converting csv data into array of objects
    const userInfo = [];
    const defaultUsers = [];    // array of users with incomplete information only

    for (var i = 0; i < jsonObj.length; i++) {
        if (jsonObj[i].Name !== '' && jsonObj[i].Email !== '') {
            var obj = {};
            obj.name = jsonObj[i].Name;
            obj.email = jsonObj[i].Email;
            obj.city = jsonObj[i].City == '' ? 'N/A' : jsonObj[i].City;
            userInfo.push(obj);
        } else if (jsonObj[i].No != '') {
            defaultUsers.push(jsonObj[i]);
        }
    }

    var incompleteInfoError = "Entry ID No."

    if (defaultUsers.length > 0) {          // collecting default users info to send in response
        defaultUsers.forEach((info) => {
            incompleteInfoError += ` ${info.No}`
        })
        incompleteInfoError += " couldn't be added due to incomplete user information"
    }

    const old_documents = await UserData.countDocuments();

    try {
        const data = await UserData.insertMany(userInfo);
        const new_documents = await UserData.countDocuments();
        const new_user_count = new_documents - old_documents
        res.status(200).json({
            success: true,
            message: "CSV data Successfully Uploaded!",
            defaultUsersInfo: defaultUsers.length > 0 ? incompleteInfoError : 'Count 0',
            uploaded_documents: data,
            new_user_count,
            not_added_user_count: (userInfo.length + defaultUsers.length) - new_user_count,
            total_user_in_db: new_documents,

        });
    }
    catch (error) {
        if (error.name === 'MongoBulkWriteError') {       // duplicate entry error
            const new_documents = await UserData.countDocuments();
            const new_user_count = new_documents - old_documents
            const original_entry = await UserData.findOne({ email: error.writeErrors[0].err.op.email });
            res.status(400).json({
                success: false,
                defaultUsersInfo: defaultUsers.length > 0 ? incompleteInfoError : 'Count 0',
                message: 'Duplicate Entry! Similar document already available in database',
                original_entry,
                duplicate_entry: error.writeErrors[0].err.op,
                new_user_count,     // always 0 
                not_added_user_count: (userInfo.length + defaultUsers.length) - new_user_count,
                total_user_in_db: new_documents
            })
        }
    }
})

module.exports = { uploadCSV };