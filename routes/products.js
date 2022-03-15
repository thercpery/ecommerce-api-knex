const express = require("express");
const auth = require("../auth");
const productController = require("../controllers/products");
const router = express.Router();

// Route for retrieving all active products.
router.get("/", (req, res) => productController.viewAllActiveProducts().then(result => res.status(result.statusCode).send(result.response)));

// Route for retrieving all products
router.get("/all", auth.verify, (req, res) => {
    const sessionData = auth.decode(req.headers.authorization);
    productController.viewAllProducts(sessionData).then(result => res.status(result.statusCode).send(result.response));
});

// Route for search products by keyword
router.get("/search", (req, res) => productController.searchProducts(req.body).then(result => res.status(result.statusCode).send(result.response)));

// Route for search all products by keyword
router.get("/search/all", auth.verify, (req, res) => {
    const sessionData = auth.decode(req.headers.authorization);
    productController.saerchAllProducts(req.body, sessionData).then(result => res.status(result.statusCode).send(result.response));
});

// Route for selling products
router.post("/sell", auth.verify, (req, res) => {
    const sessionData = auth.decode(req.headers.authorization);
    productController.sellProduct(sessionData, req.body).then(result => res.status(result.statusCode).send(result.response));
});

// Route for viewing product by ID
router.get("/:id", (req, res) => productController.viewProduct(req.params.id).then(result => res.status(result.statusCode).send(result.response)));

// Route for archiving/unarchiving the product
router.patch("/:id/changeavailability", auth.verify, (req, res) => {
    const sessionData = auth.decode(req.headers.authorization);
    productController.changeProductAvailability(sessionData, req.params.id).then(result => res.status(result.statusCode).send(result.response));
});

// Route for updating the product
router.put("/:id", auth.verify, (req, res) => {
    const sessionData = auth.decode(req.headers.authorization);
    productController.updateProduct(sessionData, req.params.id, req.body).then(result => res.status(result.statusCode).send(result.response));
});

module.exports = router;