// Name: Ho Nhat Tien
// Class: DIT/FT/1B/1B04
// Admission Number: P2205894

const db = require("./databaseConfig");

const customerDB = {
    addCustomer: function (store_id, first_name, last_name, email, address_line1, address_line2, district, city_id, postal_code, phone, callback) {
        const conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                console.error("DB not connected", err);
                return callback(err, null);
            } else {
                console.log("DB connected");
                console.log("Email", email);
                var sqlEmailCheck = `select count(*) as count from customer where email = ?;`;
                var emailCount = 0;
                conn.query(sqlEmailCheck, [email], function (err, result) {
                    // conn.end();
                    if (err) {
                        console.error(err);
                        return callback(err, null)
                    } else {
                        emailCount = result[0].count;
                        console.log("Email result count", emailCount);

                        if (emailCount === 0) {
                            sqlAddAddress = `insert into address (address, address2, district, city_id, postal_code, phone) values (?, ?, ?, ?, ?, ?);`;
                            conn.query(sqlAddAddress, [address_line1, address_line2, district, city_id, postal_code, phone], function (err, result) {
                                // conn.end();
                                if (err) {
                                    console.error("Unexpected error in inserting the address", err);
                                    return callback(err, null);
                                } else {
                                    console.log("Address result", result);
                                    let adderss_id = result.insertId;

                                    console.log("address_id: ", adderss_id);

                                    sqlAddCustomer = `insert into customer(store_id, first_name, last_name, email, address_id) values (?, ?, ?, ?, ?);`;
                                    conn.query(sqlAddCustomer, [store_id, first_name, last_name, email, adderss_id], function (err, result) {
                                        conn.end();
                                        if (err) {
                                            console.error("Unexpected error in inserting the customer", err);
                                            return callback(err, null);
                                        } else {
                                            console.log("Customer result", result);
                                            return callback(null, result);
                                        }
                                    });
                                }
                            });
                        } else {
                            console.log("Email already exists", email);
                            return callback(null, null);
                        }
                    }
                });


            }
        })
    },
}

module.exports = customerDB;