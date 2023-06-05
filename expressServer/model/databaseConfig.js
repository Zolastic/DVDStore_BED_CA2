// Name: Ho Nhat Tien
// Class: DIT/FT/1B/1B04
// Admission Number: P2205894

const mysql = require("mysql");
const dbconnect = {
    getConnection: function() {
        const conn = mysql.createConnection({
            host: "localhost",
            user: "bed_dvd_root",
            password: "pa$$woRD123",
            database: "bed_dvd_db"
        })
        return conn;
    }
}

module.exports = dbconnect