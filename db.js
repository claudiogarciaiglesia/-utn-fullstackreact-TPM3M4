require('dotenv').config();
const mysql = require('mysql');
const util = require('util');
let db;


const connectDatabase = () => {
    if (!db) {
        db = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE
        });

        db.connect((error) => {
            if (error) {
                throw error;
            };
        });
        console.log('Connection with database established.');
    };
    db.qy = util.promisify(db.query).bind(db);
    return db;
}

module.exports = connectDatabase();