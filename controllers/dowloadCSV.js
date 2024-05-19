const path = require('path');

const getCSVDownloadURL = async (req, res) => {
    const csvFilePath = path.join(__dirname, '../uploads', 'UserData.csv');

    res.download(csvFilePath, 'UserData.csv', (err) => {
        if (err) {
            console.log(err);
            res.status(500).json({ error: 'Failed to download CSV file' });
        }
    });
}

module.exports = getCSVDownloadURL