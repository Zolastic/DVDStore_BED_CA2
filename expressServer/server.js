// Name: Ho Nhat Tien
// Class: DIT/FT/1B/1B04
// Admission Number: P2205894

const app = require("./controller/app");
const hostname = "localhost";
const port = 8081;
const server = app.listen(port, hostname, () => {
    console.log(`Web app is hosted at http://${hostname}:${port}`);
});