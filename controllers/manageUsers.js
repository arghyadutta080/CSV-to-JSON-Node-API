const csv = require('csvtojson');
const UserData = require('../models/userDataModel.js');
const asyncError = require('../middlewares/asyncError.js');
const { ErrorHandler } = require('../utils/customError.js');
const { baseHtml } = require('../utils/unsubscribePage.js');
const updateCSV = require('../utils/updateCSV.js');


const arrUpdateAndStrConcate = async (mode, jsonObj, userInfo, defaultUsers, incompleteInfoError) => {
    for (var i = 0; i < jsonObj?.length; i++) {
        if ((jsonObj[i].name !== '') && (jsonObj[i].email !== '')) {
            var obj = {};
            obj.name = jsonObj[i].name;
            obj.email = jsonObj[i].email;
            obj.city = jsonObj[i].city == '' ? 'N/A' : jsonObj[i].city;

            // console.log(jsonObj);
            userInfo.push(obj);

        } else if (jsonObj[i].name === '' || jsonObj[i].email === '' || jsonObj[i].city === '') {
            defaultUsers.push(jsonObj[i]);      // collecting default users info to send in response
            mode === "csv" ? incompleteInfoError += ` ${i + 2},` : incompleteInfoError += ` ${i + 1},`;
        }
    }
    mode === "csv" ?
        incompleteInfoError += " in CSV file couldn't be added due to incomplete user information" :
        incompleteInfoError += " couldn't be added due to incomplete user information";

    return { userInfo, defaultUsers, incompleteInfoError };
}

const handleDublicates = (dublicates) => {
    const dublicateEntries = dublicates.map((err) => { 
        var str = ''
        str = str + err.err.op.name + ',' + err.err.op.email + ',' + err.err.op.city + ',' + 'Dublicate Entry' + '\r'
        return str;
    })

    return dublicateEntries;
}

const handleDefaults = (defaults) => {
    const defaultEntries = defaults.map((entry) => {
        var str = ''
        str = str + entry.name + ',' + entry.email + ',' + entry.city + ',' + 'Default/Incomplete Entry' + '\r'
        return str;
    })

    return defaultEntries;
}

const handleMultipleDocInsertion = async (userInfo, defaultUsers, incompleteInfoError, res) => {
    const old_documents = await UserData.countDocuments();
    const default_users = handleDefaults(defaultUsers);
    const title = `name,email,city,error\r`
    
    try {
        const data = await UserData.insertMany(userInfo, { ordered: false });
        const new_documents = await UserData.countDocuments();
        const new_user_count = new_documents - old_documents
        default_users = [title, ...default_users];
        await updateCSV(default_users);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            success: true,
            message: new_user_count > 0 ? "Data Successfully Uploaded!" : 'There is no data to upload!',
            defaultUsersInfo: defaultUsers.length > 0 ? incompleteInfoError : 'Count 0',
            uploaded_documents: data,
            new_user_count,
            default_user_count: defaultUsers.length,        
            non_added_user_data: `/api/v1/download-csv`,    // no duplicate entry inside try block, only for default users
            total_user_in_db: new_documents,
        });
    }
    catch (error) {
        if (error.name === 'MongoBulkWriteError') {       // duplicate entry error
            const all_documents = await UserData.countDocuments();
            const new_user_count = all_documents - old_documents
            const duplicate_users = handleDublicates(error.writeErrors);
            const non_added_users = [title, ...duplicate_users, ...default_users]
            await updateCSV(non_added_users);
            res.setHeader('Content-Type', 'application/json');
            res.status(400).json({
                success: new_user_count > 0 ? true : false,
                defaultUsersInfo: defaultUsers.length > 0 ? incompleteInfoError : 'Count 0',
                message: 'Duplicate Entry! Similar document already available in database',
                new_user_count,
                duplicate_user_count: userInfo.length - new_user_count,
                non_added_user_data: `/api/v1/download-csv`,
                total_user_in_db: all_documents,
            })
        }
    }
}


const uploadCSV = asyncError(async (req, res, next) => {
    const jsonObj = await csv().fromFile(req.file.path);    // converting csv data into array of objects

    // console.log('csvData', jsonObj);
    const userInfo = [];

    const defaultUsers = [];    // array of users with incomplete information only
    var incompleteInfoError = "Row No."

    const mode = "csv";

    const updates = await arrUpdateAndStrConcate(mode, jsonObj, userInfo, defaultUsers, incompleteInfoError);

    // console.log('updates:', updates);

    handleMultipleDocInsertion(updates.userInfo, updates.defaultUsers, updates.incompleteInfoError, res);
})


const addNewUsersManually = asyncError(async (req, res, next) => {
    const { users } = req.body;
    // console.log('users: ', users);
    const userInfo = [];

    const defaultUsers = [];    // array of users with incomplete information only
    var incompleteInfoError = "Data entry No."

    const mode = "manual";

    const updates = await arrUpdateAndStrConcate(mode, users, userInfo, defaultUsers, incompleteInfoError);

    handleMultipleDocInsertion(updates.userInfo, updates.defaultUsers, updates.incompleteInfoError, res);
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


module.exports = { uploadCSV, addNewUsersManually, changeSubscribedStatus };