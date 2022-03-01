const express = require("express");
const auth = require("../auth");
const orderController = require("../controllers/orders");
const router = express.Router();

// Route for getting authenticated user's orders
router.get("/myorders", auth.verify, (req, res) => {
    const sessionData = auth.decode(req.headers.authorization);
    orderController.viewOrdersFromUser(sessionData).then(result => res.status(result.statusCode).send(result.response));
});

// Route for ordering a product
router.post("/buynow", auth.verify, (req, res) => {
    const sessionData = auth.decode(req.headers.authorization);
    orderController.orderProduct(sessionData, req.body).then(result => res.status(result.statusCode).send(result.response));
});

// Route for viewing all orders.
router.get("/all", auth.verify, (req, res) => {
    const sessionData = auth.decode(req.headers.authorization);
    orderController.viewAllOrders(sessionData).then(result => res.status(result.statusCode).send(result.response));
});

// Route for checking out items in the cart
router.post("/checkoutcart", auth.verify, (req, res) => {
    const sessionData = auth.decode(req.headers.authorization);
    orderController.checkoutFromCart(sessionData).then(result => res.status(result.statusCode).send(result.response));
});

module.exports = router;