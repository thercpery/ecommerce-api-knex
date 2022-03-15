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
    Sell a product
    Business Logic:
    1. Check if the authenticated user is an admin. If not, return false.
    2. If authenticated user is an admin, add the item. 
*/
module.exports.sellProduct = (sessionData, productData) => {
    return knex("users")
    .first()
    .where({
        id: sessionData.id 
    })
    .then((user, err) => {
        if(err) return {
            statusCode: 500,
            response: false
        };
        else{
            if(user.is_admin) {
                return knex("products")
                .insert(productData)
                .then((saved, err) => {
                    if(err) return {
                        statusCode: 500,
                        response: false
                    };
                    else{
                        if(saved !== 0) return {
                            statusCode: 201,
                            response: true
                        };
                        else return {
                            statusCode: 403,
                            response: false
                        };
                    }
                });
            }
            else return {
                statusCode: 401,
                response: false
            };
        }
    });
};

/* 
    View product
    Business Logic:
    1. Find the product data that matches the parameter ID.
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
        else {
            if(product !== undefined){
                // If item found
                return {
                    statusCode: 200,
                    response: product
                };
                
            }
            else{
                // If item is not found
                return {
                    statusCode: 404,
                    response: false
                };
            }
        }
    })
};

/* 
    Archive product
    Business Logic:
    1. Find the product data that matches the parameter ID. If not found, return false.
    2. If found, check if the session user is an admin. If user is not an admin, return false.
    3. If the user is an admin, archive/unarchive the item. 
*/
module.exports.changeProductAvailability = (sessionData, productId) => {
    return knex("products")
    .first()
    .where({
        id: productId
    })
    .then((product, err) => {
        if(err) return {
            statusCode: 500,
            response: false
        };
        else{
            if(sessionData.is_admin && product !== undefined){
                return knex("products")
                .update({
                    is_active: !product.is_active
                })
                .where({
                    id: productId
                })
                .then((saved, err) => {
                    if(err) return {
                        statusCode: 500,
                        response: false
                    };
                    else return {
                        statusCode: 201,
                        response: true
                    };
                });
            }
            else return {
                // Session user is not admin
                statusCode: 401,
                response: false
            };
        }
    });
};

/* 
    Update a product
    Business Logic:
    1. Find the product data that matches the parameter ID. If not found, return false.
    2. If found, check if the user is an admin. If not, return false.
    3. If user is an admin, update the data in the database.
*/
module.exports.updateProduct = (sessionData, productId, productData) => {
    return knex("products")
    .first()
    .where({
        id: productId
    })
    .then((product, err) => {
        if(err) return {
            statusCode: 500,
            response: false
        };
        else{
            if(sessionData.is_admin && product !== undefined){
                return knex("products")
                .update(productData)
                .where({
                    id: product.id
                })
                .then((saved, err) => {
                    if(err) return {
                        statusCode: 500,
                        response: false
                    };
                    else {
                        if(saved !== 0) return {
                            statusCode: 201,
                            response: true
                        };
                        else return {
                            statusCode: 403,
                            response: false
                        };
                    }
                });
            }
            else return {
                statusCode: 401,
                response: false
            };
        }
    });
};

/* 
    Search a product through a keyword
    Business Logic:
    1. Get the keyword from the request body.
    2. Search the products data that matches the keyword (name, description).
    3. Return all the data THAT IS IN STOCK.
*/
module.exports.searchProducts = (filter) => {
    return knex
    .select()
    .from("products")
    .where((builder) => {
        builder
        .where({is_active: true})
        .where("name", "ilike", `%${filter.keyword}%`)
        .orWhere("description", "ilike", `%${filter.keyword}%`)
    })
    .then((products, err) => {
        if(err) return {
            statusCode: 500,
            response: false
        };
        else return{
            statusCode: 200,
            response: products
        }; 
    });
};

/* 
    Search all products via keyword (admin only access).
    Business Logic:
    1. 1. Get the keyword from the request body.
    2. Search the products data that matches the keyword (name, description).
    3. Return all the data.
*/
module.exports.saerchAllProducts = (filter, sessionData) => {
    return knex
    .select()
    .from("products")
    .where((builder) => {
        builder
        .where("name", "ilike", `%${filter.keyword}%`)
        .orWhere("description", "ilike", `%${filter.keyword}%`)
    })
    .then((products, err) => {
        if(err) return {
            statusCode: 500,
            response: false
        };
        else {
            if(sessionData.is_admin) return {
                statusCode: 200,
                response: products
            };
            else return {
                statusCode: 403,
                response: false
            };
        }
    });
};

/* 
    TODO:
    1. Hot products/featured products section within the past 30 days.
    2. Refactor code with quantity column.
*/