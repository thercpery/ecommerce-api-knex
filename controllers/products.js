const knex = require("../db/config");
const auth = require("../auth");

/* 
    View all active products.
    Business Logic
    1. Find all items that is in stock/active.
    2. Return all data
*/
module.exports.viewAllActiveProducts = () => {
    return knex
    .select()
    .from("products")
    .where({
        is_active: true
    })
    .then((products, err) => {
        if(err) return {
            statusCode: 500,
            response: false
        };
        else{
            if(products.length !== 0) return {
                statusCode: 200,
                response: products
            };
            else return {
                statusCode: 200,
                response: false
            };
        }
    });
};

/* 
    View all products
    Business Logic:
    1. Find all the products.
    2. If the authenticated user is an admin, return the data. Otherwise, return false.
*/
module.exports.viewAllProducts = (sessionData) => {
    return knex
    .select()
    .from("products")
    .then((products, err) => {
        if(err) return {
            statusCode: 500,
            response: false
        };
        else if(!sessionData.is_admin) return {
            statusCode: 403,
            response: false
        };
        else return {
            statusCode: 200,
            response: products
        };
    });
};

/* 
    View product
    Business Logic:
    1. Find the porduct data that matches the parameter ID.
    2. Return the data.
*/
module.exports.viewProduct = (productId) => {
    return knex("products")
    .first()
    .where({
        id: productId,
        is_active: true
    })
    .then((product, err) => {
        if(err) return {
            statusCode: 500,
            response: false
        };
        else return {
            statusCode: 200,
            response: product
        };
    })
};