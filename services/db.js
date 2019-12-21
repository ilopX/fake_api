const fs = require('fs');
const path = require('path');

function JsonService() {};

JsonService.DB_PATH = path.join(__dirname, "..", 'db.json');

JsonService.save = async (callback) => {
    return new Promise((resolve, reject) => {
        let fromCallback = null;
        console.log('enter to parser');
        fs.readFile(JsonService.DB_PATH, 'utf8', function readFileCallback(err, data) {
            if (err) {
                return reject(err);
            } else {

                let obj = JSON.parse(data); //now it an object
                //change obj by ref
                fromCallback = callback(obj); //add some data
                let json = JSON.stringify(obj); //convert it back to json
                fs.writeFile(JsonService.DB_PATH, json, 'utf8', (err) => {
                    if (err) return reject(err);
                    console.log('The file has been saved!');
                    resolve(fromCallback)
                }); // write it back
            }
        });
        return fromCallback
        }
    )
};

JsonService.find = async (callback) => {
    return new Promise((resolve, reject) => {
            fs.readFile(JsonService.DB_PATH, 'utf8', function readFileCallback(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(callback(JSON.parse(data)))
                }
            });
        }
    )
};
module.exports = JsonService;