const express = require("express");
const auth = require("../auth");
const userController = require("../controllers/users");
const router = express.Router();

// Route for checking if email exists.
router.post("/checkemail", (req, res) => userController.checkEmailExists(req.body).then(result => res.status(result.statusCode).send(result.response)));

// Route for signing up.
router.post("/signup", (req, res) => userController.signupUser(req.body).then(result => res.status(result.statusCode).send(result.response)));

// Route for logging in.
router.post("/login", (req, res) => userController.loginUser(req.body).then(result => res.status(result.statusCode).send(result.response)));

// Route for retrieving a user
router.get("/details", auth.verify, (req, res) => {
    const sessionData = auth.decode(req.headers.authorization);
    userController.getProfile(sessionData).then(result => res.status(result.statusCode).send(result.response));
})

module.exports = router;