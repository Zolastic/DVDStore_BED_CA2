// Name: Ho Nhat Tien
// Class: DIT/FT/1B/1B04
// Admission Number: P2205894

const express = require("express");
const bodyParser = require("body-parser");
const actor = require("../model/actor");
const customer = require("../model/customer");
const user = require("../model/admin");
const film = require("../model/film");
const verifyFN = require("../auth/verifyToken");
const e = require("express");
const multer = require("multer");
const fs = require("fs");

//creating web server
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));  // this is for x-www-from-urlencoded
app.use(bodyParser.json())  //this is for raw

var cors = require('cors');		// cors stands for Cross Origin Resource Policy. Allows to get request from multiple hosts. In this case, firstExpressServer and firstFrontEnd have different host linnks. One is 8081 while the other is 3001
const { type } = require("os");
app.options('*', cors());
app.use(cors());

//multer options
const upload = multer({
    dest: 'images'
})


// to add an actor
app.post("/actors",  verifyFN.verifyToken, verifyFN.verifyAdmin, (req, res) => {
    const body = req.body;
    if (body == null || body.first_name == null || body.last_name == null || body.first_name == "" || body.last_name == "") {
        console.log("missing data")
        res.status(400).send({ "error_msg": "missing data" });
        return;
    }

    const first_name = req.body.first_name;
    const last_name = req.body.last_name

    actor.addActor(first_name, last_name, (err, result) => {
        if (!err) {
            res.status(201).send({ actor_id: result.insertId });
        } else {
            res.status(500).send({ "error_msg": "Internal server error" });
        }
    })
})


// to add a customer
app.post("/customers", verifyFN.verifyToken, verifyFN.verifyAdmin, (req, res) => {
    const body = req.body;
    const store_id = body.store_id;
    const first_name = body.first_name;
    const last_name = body.last_name;
    const email = body.email;
    const address = body.address;
    const address_line1 = address.address_line1;
    const address_line2 = address.address_line2;
    const district = address.district;
    const city_id = address.city_id;
    const postal_code = address.postal_code;
    const phone = address.phone;

    if (body == null || store_id == null || first_name == null || last_name == null || email == null || address_line1 == null || district == null || district == null || city_id == null || postal_code == null || phone == null || body == null || store_id == "" || first_name == "" || last_name == "" || email == "" || address_line1 == "" || district == "" || district == "" || city_id == "" || postal_code == "" || phone == "") {
        res.status(400).send({ "error_msg": "missing data" });
        return;
    }

    customer.addCustomer(store_id, first_name, last_name, email, address_line1, address_line2, district, city_id, postal_code, phone, (err, result) => {
        if (!err) {
            if (result == null) {
                res.status(409).send({ error_msg: "email already exists" });
            } else {
                console.log(result);
                res.status(201).send({ customer_id: result.insertId });
            }
        } else {
            res.status(500).send({ "error_msg": "Internal server error" });
        }
    });
});

// User Login
app.post("/staff/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    user.login(email, password, (err, token, result) => {
        if (!err) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            delete result[0]['password'];   //clear the password in json data, do not send back to client
            console.log("result: ", result);
            res.json({ success: true, UserData: JSON.stringify(result), token: token, status: 'You are successfully logged in!' });
            res.send();
        } else {
            res.status(401).send({errorMessage: "Incorrect email or password"});
        }
    });

})

// Get all of the films/ DVDs
app.get("/films", (req, res) => {
    const title = req.query.title;
    const category = req.query.category;
    const maxRentalRate = req.query.maxRentalRate;

    film.getFilms(title, category, maxRentalRate, (err, result) => {
        if (!err) {
            if (result != null) {
                res.status(200).send(result);
            } else {
                res.status(204).send(result);
            }
        }
    })
});

// Get a specific film/ DVD
app.get("/film", (req, res) => {
    const film_id = req.query.film_id;

    film.getFilm(film_id, (err, result) => {
        if (!err) {
            if (result != null) {
                console.log("result: ", result);
                res.status(200).send(result);
            } else {
                res.status(204).send(result);
            }
        }
    });
});


// To verify whether user is an admin when they try to access adminAccess.html
app.get("/verify", verifyFN.verifyToken, verifyFN.verifyAdmin, (req, res) => {
    res.status(200).send("Authorized");
})

// To add a new film/ DVD
app.post("/film", verifyFN.verifyToken, verifyFN.verifyAdmin, upload.single("image"), (req, res) => {
    const body = req.body;
    console.log("body: ", body);
    const title = body.title;
    let image = req.file;
    let description = body.description;
    let release_year = body.release_year;
    const language_id = body.language_id;
    let original_language_id = body.original_language_id;
    let rental_duration = body.rental_duration;
    let rental_rate = body.rental_rate;
    let length = body.length;
    let replacement_cost = body.replacement_cost;
    let rating = body.rating;
    let special_features = body.special_features;
    const category_id = body.category_id;
    let actors = body.actors;

    console.log("title: ", title);
    console.log("image: ", image);

    if (title == "" || language_id == "" || category_id == "" || actors == "") {
        res.status(400).send("Missing Data");
        return;
    }

    if (description == "") {
        description = null
    }

    if (release_year == "") {
        release_year = null;
    }

    if (original_language_id == "") {
        original_language_id = null
    }

    if (rental_duration == "") {
        rental_duration = 3;
    }

    if (rental_rate == "") {
        rental_rate = 4.99;
    }
    
    if (length == "") {
        length = null;
    }

    if (replacement_cost == "") {
        replacement_cost = 19.99;
    }

    if (rating == "") {
        rating = "G";
    }

    if (special_features == "") {
        special_features = null;
    }

    if (image == "" || image == null) {
        image = null;
    } else {
        const binaryData = fs.readFileSync(req.file.path);
        image = new Buffer(binaryData).toString('base64');

    }

    console.log("actors before split: ", actors);
    actors = actors.split(", ");
    console.log("actors array: ", actors);

    film.addFilm(title, description, release_year, language_id, original_language_id, rental_duration, rental_rate, length, replacement_cost, rating, special_features, image, category_id, actors, (err, result) => {
        if (!err) {
            console.log("result: ", result);
            res.status(200).send({result: result});
        } else {
            res.status(500).send();
        }
    });    
    


});

// to get all the languages from the database
app.get("/language", (req, res) => {
    film.getLanguage((err, result) => {
        if (!err) {
            res.status(200).send(result);
        } else {
            res.status(500).send("error");
        }
    });
});


// to get all the categories from the database
app.get("/category", (req, res) => {
    film.getCategory((err, result) => {
        if (!err) {
            res.status(200).send(result);
        } else {
            res.status(500).send("error");
        }
    });
})


module.exports = app;