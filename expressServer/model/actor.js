// Name: Ho Nhat Tien
// Class: DIT/FT/1B/1B04
// Admission Number: P2205894

const db = require("./databaseConfig");

const actorDB = {
    addActor: function (first_name, last_name, callback) {
        const conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                console.error("not connected", err);
                return callback(err, null);
            } else {
                console.log("connected");
                const sql = `insert into actor (first_name, last_name) values (?, ?);`
                conn.query(sql, [first_name, last_name], function (err, result) {
                    conn.end();
                    if (err) {
                        console.error("Unexpected error in inserting the actor", err);
                        return callback(err, null);
                    } else {
                        console.log("Inserted actor", result);
                        return callback(null, result);
                    }
                });
            }
        });
    },
}

module.exports = actorDB;