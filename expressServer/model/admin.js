// Name: Ho Nhat Tien
// Class: DIT/FT/1B/1B04
// Admission Number: P2205894

const db = require("./databaseConfig");
var config = require('../config.js');
var jwt = require('jsonwebtoken');
const e = require("express");

const adminDB = {
    login: function (email, password, callback) {
        const conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                console.error("Erorr: ", err);
                return callback(err, null);
            } else {
                console.log("DB successfully connected");

                let sql = `select * from admin where email=? and password=?`;
                conn.query(sql, [email, password], function(err, result) {
                    conn.end();
                    if (err) {
                        console.error("Erorr: ", err);
                        return callback(err, null, null);
                    } else {
                        let token = "";

                        if (result.length === 1) {
                            const userid = result[0].user_id;
                            const role = result[0].role;
                            const payload = {id: userid, role: role};
                            const token = jwt.sign(payload, config.key, {expiresIn:86400});
							console.log("token: ", token);
							return callback(null, token, result);
                        } else {
                            var errorMessage = new Error("Incorrect email or password");
                            return callback(errorMessage, null, null);
                        }
                    }
                });
            }
        })
    }
}

module.exports = adminDB;