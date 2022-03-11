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
});

// Route for changing password
router.patch("/changepassword", auth.verify, (req, res) => {
    const sessionData = auth.decode(req.headers.authorization);
    userController.changePassword(sessionData, req.body).then(result => res.status(result.statusCode).send(result.response));
});

// Route for adding to cart
router.put("/addtocart", auth.verify, (req, res) => {
    const sessionData = auth.decode(req.headers.authorization);
    userController.addToCart(sessionData, req.body).then(result => res.status(result.statusCode).send(result.response));
});

// Route for viewing cart items.
router.get("/cart", auth.verify, (req, res) => {
    const sessionData = auth.decode(req.headers.authorization);
    userController.viewCartItems(sessionData, req.body).then(result => res.status(result.statusCode).send(result.response));
});

// Route for incrementing cart item
router.put("/cart/:id/increment", auth.verify, (req, res) => {
    const sessionData = auth.decode(req.headers.authorization);
    userController.incrementCartItem(sessionData, req.params.id).then(result => res.status(result.statusCode).send(result.response));
});

// Route for decrementing cart item
router.put("/cart/:id/decrement", auth.verify, (req, res) => {
    const sessionData = auth.decode(req.headers.authorization);
    userController.decrementCartItem(sessionData, req.params.id).then(result => res.status(result.statusCode).send(result.response));
});

// Route for deleting a cart item
router.delete("/cart/:id/remove", auth.verify, (req, res) => {
    const sessionData = auth.decode(req.headers.authorization);
    userController.removeItemInCart(sessionData, req.params.id).then(result => res.status(result.statusCode).send(result.response));
});

// Route for viewing all users
router.get("/all", auth.verify, (req, res) => {
    const sessionData = auth.decode(req.headers.authorization);
    userController.viewAllUsers(sessionData).then(result => res.status(result.statusCode).send(result.response));
});

// Route for setting user as admin.
router.patch("/:id/setasadmin", auth.verify, (req, res) => {
    const sessionData = auth.decode(req.headers.authorization);
    const userData = {
        changeToAdminId: req.params.id,
        sessionUserId: sessionData.id
    };
    userController.setAdminPrivileges(userData).then(result => res.status(result.statusCode).send(result.response));
});

module.exports = router;