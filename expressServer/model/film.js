// Name: Ho Nhat Tien
// Class: DIT/FT/1B/1B04
// Admission Number: P2205894

const e = require("express");
const db = require("./databaseConfig");

const filmDB = {

    getFilms: function (title, category, maxRentalRate, callback) {
        const conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                console.error("Error: ", error);
                return callback(err, null);
            } else {
                console.log("DB successfully connected");

                console.log("title: ", title);
                console.log("category: ", category);
                console.log("maxRentalRate: ", maxRentalRate);

                let sql = null;
                const params = [];
                if (title != null) {
                    sql = `SELECT film.film_id ,film.title, category.name as "category", film.release_year, film.description, film.rating FROM film, category, film_category 
                    where film.title like ? 
                    and film.film_id = film_category.film_id
                    and film_category.category_id = category.category_id`;
                    params.push(`%${title}%`);
                    if (maxRentalRate != null) {
                        sql += ' and film.rental_rate < ?';
                        params.push(maxRentalRate);
                    }
                } else if (category != null) {
                    sql = ` SELECT film.film_id ,film.title, category.name as "category", film.release_year, film.description, film.rating FROM film, category, film_category 
                    where category.name = ? 
                    and category.category_id = film_category.category_id 
                    and film_category.film_id = film.film_id`;
                    params.push(category);
                    if (maxRentalRate != null) {
                        sql += ' and film.rental_rate < ?';
                        params.push(maxRentalRate);
                    }
                }
                conn.query(sql, params, function (err, result) {
                    conn.end();
                    if (err) {
                        console.error("Error: ", err)
                        return callback(err, null)
                    } else {
                        if (result.length == 0) {
                            console.log("No Result: ", result);
                            return callback(null, null);
                        } else {
                            // console.log("Result: ", result);
                            return callback(null, result);
                        }
                    }
                });

            }
        });
    },

    getFilm: function(film_id, callback) {
        const conn = db.getConnection();
        conn.connect(function(err) {
            if (err) {
                console.error("Error: ", err);
            } else {
                console.log("DB successfully connected")
                console.log("Inside getFilm");

                console.log("film_id: ", film_id);

                let sql = `SELECT film.title, film.image, category.name as "category", film.release_year, film.description, film.rating, concat(actor.first_name, ' ', actor.last_name) as 'actor' 
                FROM film, category, film_category, actor, film_actor 
                where film.film_id = ?
                and film.film_id = film_category.film_id 
                and film_category.category_id = category.category_id 
                and film.film_id = film_actor.film_id 
                and film_actor.actor_id = actor.actor_id;`;

                conn.query(sql, [film_id], function(err, result) {
                    conn.end();

                    if (err) {
                        console.error("Error: ", err)
                        return callback(err, null)
                    } else {
                        if (result.length == 0) {
                            console.log("No Result: ", result);
                            return callback(null, null);
                        } else {
                            const actors = result.map(item => item.actor).join(", ");
                            console.log("Actors after map and join", actors);
                            const data = {
                                title: result[0].title,
                                category: result[0].category,
                                release_year: result[0].release_year,
                                description: result[0].description,
                                rating: result[0].rating,
                                image: result[0].image,
                                actors: actors
                            }
                            return callback(null, data);
                        }
                    }
                })
            }
        });
    },

    addFilm: function(title, description, release_year, language_id, original_language_id, rental_duration, rental_rate, length, replacement_cost, rating ,special_features, image, category_id, actors, callback) {
        const conn = db.getConnection();
        conn.connect(function(err) {
            if (err) {
                console.error("error: ", err);
                return callback(err, null);
            } else {
                console.log("DB successfully connected");

                let sql = `INSERT INTO film (title, description, release_year, language_id, original_language_id, rental_duration, rental_rate, length, replacement_cost, rating ,special_features, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
                conn.query(sql, [title, description, release_year, language_id, original_language_id, rental_duration, rental_rate, length, replacement_cost, rating, special_features, image], function(err, result) {
                    if (err) {
                        console.error("error: ", err);
                        return callback(err, null)
                    } else {
                        console.log("result: ", result);
                        let film_id = result.insertId;
                        console.log("film_id: ", film_id);
                        sql = `INSERT into film_category (film_id, category_id) VALUES (?, ?);`;
                        conn.query(sql, [film_id, category_id], function(err, result) {
                            if (err) {
                                console.error("error: ", err);
                                return callback(err, null);
                            } else {
                                console.log("successfully added category");

                                let actorsID = [];
                                console.log("actors: ", actors);
                                
                                sql = `SELECT actor.actor_id from actor where concat(actor.first_name, ' ', actor.last_name) in (?); `;
                                conn.query(sql, [actors], function(err, result) {
                                    // conn.end();
                                    if (err) {
                                        conn.end();
                                        console.error("error: ", err);
                                        return callback(err, null);
                                    } else{
                                        console.log("result actor: ", result);
                                        if (result.length == 0) {
                                            conn.end();
                                            console.log("No actor found");
                                            return callback(null, film_id);
                                        }
                                        
                                        actorsID = result.map((row) => {
                                            return row.actor_id;
                                        });
                                        console.log("actorsID: ", actorsID);
                                        sql = `INSERT INTO film_actor (actor_id, film_id) VALUES (?, ?);`
                                        for (let i = 0; i < actorsID.length; i++) {
                                            conn.query(sql, [actorsID[i], film_id], function(err, result) {
                                                if (err) {
                                                    console.error("error: ", err);
                                                    return callback(err, null);
                                                } else {
                                                    console.log("result after adding actors: ", result);
                                                    if (i ==  actorsID.length - 1) {
                                                        conn.end();
                                                        return callback(null, film_id);
                                                    }
                                                }
                                            });
                                        }

                                    }
                                });


                            }
                        })
                    }
                });
            }
        });
    },

    getLanguage: function(callback) {
        const conn = db.getConnection();
        conn.connect(function(err) {
            if (err) {
                console.error("error: ", err);
                return callback(err, null);
            } else {
                console.log("DB successfully connected");

                let sql = `SELECT * FROM bed_dvd_db.language;`;
                conn.query(sql, [], function(err, result) {
                    if (err) {
                        console.error("error: ", err);
                        return callback(err, null);
                    } else {
                        console.log("result language: ", result);
                        return callback(null, result);
                    }
                })
            }
        });
    },
    
    getCategory: function(callback) {
        const conn = db.getConnection();
        conn.connect(function(err) {
            if (err) {
                console.error("error: ", err);
                return callback(err, null);
            } else {
                console.log("DB successfully connected");

                let sql = `SELECT * FROM bed_dvd_db.category;`;
                conn.query(sql, [], function(err, result) {
                    if (err) {
                        console.error("error: ", err);
                        return callback(err, null);
                    } else {
                        console.log("result language: ", result);
                        return callback(null, result);
                    }
                })
            }
        });
    }
}

module.exports = filmDB;
