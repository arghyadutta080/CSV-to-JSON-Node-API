const csv = require('csvtojson');
const UserData = require('../models/userDataModel.js');
const asyncError = require('../middlewares/asyncError.js');
const { ErrorHandler } = require('../utils/customError.js');
const { baseHtml } = require('../utils/unsubscribePage.js');


const arrUpdateAndStrConcate = (jsonObj, userInfo, defaultUsers, incompleteInfoError) => {
    for (var i = 0; i < jsonObj.length; i++) {
        if (jsonObj[i].Name !== '' && jsonObj[i].Email !== '') {
            var obj = {};
            obj.name = jsonObj[i].Name;
            obj.email = jsonObj[i].Email;
            obj.city = jsonObj[i].City == '' ? 'N/A' : jsonObj[i].City;
            userInfo.push(obj);

        } else if (jsonObj[i].Name === '' || jsonObj[i].Email === '' || jsonObj[i].City === '') {
            defaultUsers.push(jsonObj[i]);      // collecting default users info to send in response
            incompleteInfoError += ` ${i + 2},`;
        }
    }
    incompleteInfoError += " in CSV file couldn't be added due to incomplete user information";
}


const uploadCSV = asyncError(async (req, res, next) => {
    const jsonObj = await csv().fromFile(req.file.path);    // converting csv data into array of objects
    const userInfo = [];

    const defaultUsers = [];    // array of users with incomplete information only
    var incompleteInfoError = "Row No."

    arrUpdateAndStrConcate(jsonObj, userInfo, defaultUsers, incompleteInfoError);

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


const changeSubscribedStatus = asyncError(async (req, res, next) => {      
    const { id } = req.params;
    const user = await UserData.findById(id);

    if (!user) return next(new ErrorHandler("User not found", 404));

    user.subscribed = !user.subscribed;
    await user.save();

    const dynamicHtml = baseHtml.replace('User', user.name);  // Replace placeholder in template with user name

    res.setHeader('Content-Type', 'text/html');  
    res.send(dynamicHtml);
})

module.exports = { uploadCSV, changeSubscribedStatus };