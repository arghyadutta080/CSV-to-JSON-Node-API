const csv = require('csvtojson');
const UserData = require('../models/userDataModel.js');
const asyncError = require('../middlewares/asyncError.js');
const { ErrorHandler } = require('../utils/customError.js');


const uploadCSV = asyncError(async (req, res, next) => {
    const jsonObj = await csv().fromFile(req.file.path);
    console.log(jsonObj);
    var userInfo = [];
    for (var i = 0; i < jsonObj.length; i++) {
        if (jsonObj[i].Name !== '' && jsonObj[i].Email !== '') {
            var obj = {};
            obj.name = jsonObj[i].Name;
            obj.email = jsonObj[i].Email;
            obj.city = jsonObj[i].City == '' ? 'N/A' : jsonObj[i].City;
            userInfo.push(obj);
        }
    }

    const old_documents = await UserData.countDocuments();

    try {
        const data = await UserData.insertMany(userInfo);
        const new_documents = await UserData.countDocuments();
        const new_user_count = new_documents - old_documents
        res.status(200).json({
            success: true,
            message: "CSV data Successfully Uploaded!",
            uploaded_documents: data,
            new_user_count, 
            not_added_user_count: userInfo.length - new_user_count,
            total_user_in_db: new_documents 
        });
    }
    catch (error) {
        if (error.name === 'MongoBulkWriteError') {
            const new_documents = await UserData.countDocuments();
            const new_user_count = new_documents - old_documents
            const original_entry = await UserData.findOne({ email: error.writeErrors[0].err.op.email });
            res.status(400).json({
                success: false,
                message: 'Duplicate Entry! Similar document found in database',
                original_entry,
                duplicate_entry: error.writeErrors[0].err.op,
                new_user_count,
                not_added_user_count: userInfo.length - new_user_count,     // always 0 
                total_user_in_db: new_documents 
            })
        }
    }
})

module.exports = { uploadCSV };