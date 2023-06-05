// Name: Ho Nhat Tien
// Class: DIT/FT/1B/1B04
// Admission Number: P2205894

const jwt = require("jsonwebtoken");
const config = require("../config");

const verifyFn = {
    verifyToken: function (req, res, next) {
        console.log("req headers: ", req.headers);  //for debugging purposes

        //retrieve the authorization header's content
        const authHeader = req.headers["authorization"];
        console.log("authHeader: ", authHeader);

        //if authHeader does not exists or
        //authHeader does not have the word, Bearer
        if (!authHeader || !authHeader.includes("Bearer")) {  //must have a space next to Bearer. Looks like "Bearer "
            return res.status(403).send({ auth: false, message: "authHeader error" });
        } else {
            //retrieve the token
            const token = authHeader.replace("Bearer ", ""); // Since we put "Bearer <token>" in the authorization header, to get the token, we need to get rid of the Bearer by replacing it with an empty string
            console.log("token: ", token);

            //verify token
            jwt.verify(token, config.key, function (err, payload) {
                if (err) {
                    console.error("verify error:", err);
                    return res.status(401).send({ auth: "false", message: "verify failed" });
                } else {
                    //token is good
                    req.body.payload = payload;
                    next();

                }
            });
        }
    },

    verifyAdmin: function (req, res, next) {
        const role = req.body.payload.role
        console.log("role: ", role);

        if (role == "admin") {
            next();
        } else {
            return res.status(403).send({ auth: false, message: "not an admin" });
        }
    }
}

module.exports = verifyFn;



