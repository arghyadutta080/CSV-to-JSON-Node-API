const fs = require('fs');

const updateCSV = async (linesExceptFirst) => {
    // Get an array of comma separated lines as parameter = inesExceptFirst
    // [
    //   "Arghya,arghyadutta080,Kolkata,Dublicate Entry\r",
    //   "Marko,mark909,Mumbai,Dublicate Entry\r",
    // ]

    // Turn that into a data structure we can parse (array of arrays)
    // ['Arghya', 'arghyadutta080', 'Kolkata', 'Dublicate Entry\r'],
    // ['Marko', 'mark909', 'Mumbai', 'Dublicate Entry\r'],
    let linesArr = linesExceptFirst.map(line => line.split(','));
    // console.log(linesArr)

    // Join then into a string with new lines
    // Arghya, arghyadutta080, Kolkata, Dublicate Entry
    // Marko, mark909, Mumbai, Dublicate Entry
    let output = linesArr.map((line) => {
        return line;
    }).join("\n");

    // console.log('output', output)

    // update out csv file with error reportings
    fs.writeFileSync('./uploads/UserData.csv', output);
}

module.exports = updateCSV;