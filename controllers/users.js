const knex = require("../db/config");
const bcrypt = require("bcrypt");
const auth = require("../auth");

/* 
    Check email exists
    Business Logic:
    1. Check the database to find duplicate emails.
    2. If no duplicate found, return false, otherwise return true.
*/
module.exports.checkEmailExists = (reqBody) => {
    return knex("users")
    .first()
    .where({
        email: reqBody.email
    })
    .then((user, err) => {
        if(err){
            return {
                statusCode: 500,
                response: false
            };
        }
        else{
            if(user !== undefined){
                // If email exists.
                return {
                    statusCode: 200,
                    response: true
                };
            }
            else{
                // If email does not exist.
                return {
                    statusCode: 200,
                    response: false
                };
            }
        }
    })
};

/* 
    Signup user
    Business Logic:
    1. Check if there is a duplicate email.
    2. If no duplicate, encrypt the password and save the data into the database. Otherwise, return false
*/
module.exports.signupUser = async (reqBody) => {
    const doesEmailExists = await this.checkEmailExists(reqBody);
    if(!doesEmailExists.response){
        return knex("users")
        .insert({
            email: reqBody.email,
            password: bcrypt.hashSync(reqBody.password, 10)
        })
        .then((saved, err) => {
            if(err){
                return {
                    statusCode: 500,
                    response: false
                };
            }
            else{
                return {
                    statusCode: 201,
                    response: true
                };
            }
        })
    }
    else{
        return {
            statusCode: 401,
            response: false
        };
    }
};

/* 
    Login user
    Business Logic:
    1. Check if the user's email exists. If it does not, return false.
    2. If user exists, compare the password provided in the login form with the password stored in the database.
    3. Generate/return a jsonwebtoken if the user is successfully logged in and return false if not.
*/
module.exports.loginUser = (reqBody) => {
    return knex("users")
    .first()
    .where({
        email: reqBody.email
    })
    .then((user, err) => {
        if(err){
            return {
                statusCode: 500,
                response: false
            };
        }
        else{
            if(user !== undefined){
                const isPasswordCorrect = bcrypt.compareSync(reqBody.password, user.password);
                if(isPasswordCorrect){
                    return {
                        statusCode: 200,
                        response: {
                            accessToken: auth.createAccessToken(user)
                        }
                    };
                }
                else{
                    return {
                        statusCode: 403,
                        response: false
                    };
                }
            }
            else{
                return {
                    statusCode: 403,
                    response: false
                };
            }
        }
    });
};

/* 
    Retrieving a specific user
    Business Logic:
    1. Find the user with the ID specified with the URL
    2. Display the data (if exists) EXCEPT THE PASSWORD 
    TODO:
    1. Get the orders from the user and the products the user has ordered.
    2. Get the cart items from the user.
*/
module.exports.getProfile = async (sessionData) => {
    let userData = await knex
    .first("id", "email", "is_admin", "created_at", "updated_at")
    .from("users")
    .where({
        id: sessionData.id
    })
    .then(user => user);
    
    let orderData = await knex
    .select()
    .from("orders")
    .where({
        user_id: sessionData.id
    })
    .then(order => order);

    let orderItems = await knex
    .select()
    .from("order_items")
    .then(item => item);

    let cartData = await knex
    .select()
    .from("user_carts")
    .where({
        user_id: sessionData.id
    })
    .then(cart => cart);
    console.log(cartData);

    let cartItems = await knex
    .select()
    .from("cart_items")
    .then(item => item);

    if(orderData.length > 0){
        orderData.map(order => {
            order.items = [];
            orderItems.map(item => {
                if(item.order_id === order.id) order.items.push(item);
            });
        });
    }

    if(cartData.length > 0){
        cartData.map(cart => {
            cart.items = [];
            cartItems.map(item => {
                if(item.cart_id === cart.id) cart.items.push(item);
            });
        })
    }

    userData.orders = orderData;
    userData.cart = cartData;

    return {
        statusCode: 200,
        response: userData
    };
};

/* 
    Set user as admin.
    Business Logic:
    1. Check if the authenticated user is an admin. Return false if not.
    2. If authenticated user is an admin, get the ID from the URL, then set the user given to admin and save it to the database. 
*/
module.exports.setAdminPrivileges = async (data) => {
    const isSessionUserAdmin = await knex("users")
    .first()
    .where({
        id: data.sessionUserId
    })
    .then((user, err) => {
        if(err) return false;
        else {
            if(user.is_admin) return true;
            else return false;
        }
    });
    // If user is an admin
    if(isSessionUserAdmin){
        return knex("users")
        .first()
        .where({
            id: data.changeToAdminId
        })
        .then((user, err) => {
            if(err) return {
                statusCode: 500,
                response: false
            };
            else{
                if(user !== undefined){
                    return knex("users")
                    .update({
                        is_admin: !user.is_admin
                    })
                    .where({
                        id: data.changeToAdminId
                    })
                    .whereNot("id", "=", data.sessionUserId)
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
                                // User cannot set himself/herself to admin or remove admin privileges
                                statusCode: 403,
                                response: false
                            }
                        }
                    })
                }
                else return {
                    statusCode: 401,
                    response: false
                };
            }
        });
    }
    else{
        return {
            statusCode: 403,
            response: false
        }
    }
};

/* 
    Change password
    Business Logic:
    1. Find the authenticated user ID in the database.
    2. Change the encrypted password set in the request body.
    3. Save it to the database. 
*/
module.exports.changePassword = (sessionData, reqBody) => {
    return knex("users")
    .update({
        password: bcrypt.hashSync(reqBody.password, 10)
    })
    .where({
        id: sessionData.id
    })
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
    })
};

/* 
    Add to cart
    Business Logic:
    1. Check if there is a cart data that contains the authenticated user's ID. If not found, create the cart instance in the database. If found, get the cart ID.
    2. If not found, check if the item is active/in stock.
    3. If active, add the product details and cart ID in "cart_items" table. 
*/
module.exports.addToCart = async (sessionData, cartItem) => {
    let productData;
    const isProductInStockOrExists = await knex("products")
    .first()
    .where({
        id: cartItem.productId
    })
    .then((product, err) => {
        if(err) return false;
        else{
            if(product !== undefined && product.is_active){
                productData = product;
                return true;
            }
            else return false;
        }
    });

    const isCartCreated = await knex("user_carts")
    .first()
    .where({
        user_id: sessionData.id
    })
    .then((cart, err) => {
        if(err) return false;
        else{
            if(!sessionData.is_admin){
                if(cart === undefined){
                    // If cart does not exist
                    return knex("user_carts")
                    .insert({
                        user_id: sessionData.id,
                        total_amount: cartItem.quantity * productData.price
                    })
                    .then((saved, err) => {
                        if(err || saved === 0) return false;
                        else return true;
                    });
                }
                else{
                    // If cart exist, then just increment the total amount
                    return knex("user_carts")
                    .increment({
                        total_amount: cartItem.quantity * productData.price
                    })
                    .where({
                        user_id: sessionData.id
                    })
                    .then((saved, err) => {
                        if(err || saved === 0) return false;
                        else return true;
                    });
                }
            }
            else return false;
        }
    });

    const isCartItemsCreated = await knex("user_carts")
    .first()
    .where({
        user_id: sessionData.id
    })
    .then((cart, err) => {
        if(err) return false;
        else{
            if(!sessionData.is_admin){
                if(cart !== undefined){
                    return knex("cart_items")
                    .first()
                    .where({
                        cart_id: cart.id,
                        product_id: productData.id
                    })
                    .then((cartData, err) => {
                        if(err) return false;
                        else{
                            if(cartData !== undefined){
                                // If cart item exists, just increment the quantity and the product subtotal.
                                return knex("cart_items")
                                .increment({
                                    product_quantity: cartItem.quantity,
                                    product_subtotal: cartItem.quantity * productData.price
                                })
                                .where({
                                    cart_id: cart.id,
                                    product_id: productData.id
                                })
                                .then((saved, err) => {
                                    if(err || saved === 0) return false;
                                    else return true;
                                })
                            }
                            else{
                                return knex("cart_items")
                                .insert({
                                    cart_id: cart.id,
                                    product_id: productData.id,
                                    product_name: productData.name,
                                    product_quantity: cartItem.quantity,
                                    product_price: productData.price,
                                    product_subtotal: cartItem.quantity * productData.price
                                })
                                .then((saved, err) => {
                                    if(err || saved === 0) return false;
                                    else return true;
                                })
                            }
                        }
                    });
                }
                else return false;
            }
            else return false;
        }
    });

    if(isProductInStockOrExists && isCartCreated && isCartItemsCreated) return {
        statusCode: 201,
        response: true
    };
    else return {
        statusCode: 401,
        response: false
    };
};

/* 
    View cart items
    Business Logic:
    1. Find the cart data that matches the authenticated user's ID.
    2. Display all the data.
*/
module.exports.viewCartItems = async (sessionData) => {
    const isCartEmpty = await knex("user_carts")
    .first()
    .where({
        user_id: sessionData.id
    })
    .then((cart, err) => {
        if(err || cart === undefined) return true;
        else return false;
    });

    if(!isCartEmpty){
        let cartData = await knex("user_carts")
        .first()
        .where({
            user_id: sessionData.id
        })
        .then((cart, err) => {
            if(err || cart === undefined) return false;
            else return cart;
        })
    
        cartData.items = await knex
        .select()
        .from("cart_items")
        .where({
            cart_id: cartData.id
        })
        .then((items, err) => (err) ? [] : items);
    
        if(cartData) return {
            statusCode: 200,
            response: cartData
        };
        else return {
            statusCode: 200,
            response: false
        };
    }
    else return{
        statusCode: 200,
        response: false
    };

};

/* 
    Increment cart items
    Business Logic:
    1. Get the product ID and authenticated user ID.
    2. Find the product data from the cart data.
    3. If found, increment the quantity and amount.
*/

module.exports.incrementCartItem = async (sessionData, productId) => {
    const product = await knex("products")
    .first()
    .where({
        id: productId
    })
    .then((data, err) => {
        if(err || data === undefined) return false;
        else return data;
    });

    if(product){
        return knex("user_carts")
        .first()
        .where({
            user_id: sessionData.id
        })
        .then((cart, err) => {
            if(err) return {
                statusCode: 500,
                response: false
            };
            else{
                if(cart !== undefined){
                    // If cart is found
                    return knex("cart_items")
                    .increment({
                        product_quantity: 1,
                        product_subtotal: product.price
                    })
                    .where({
                        cart_id: cart.id,
                        product_id: productId
                    })
                    .then((isCartItemsIncremented, err) => {
                        if(err) return {
                            statusCode: 500,
                            response: false
                        };
                        else {
                            if(isCartItemsIncremented !== 0){
                                return knex("user_carts")
                                .increment({
                                    total_amount: product.price
                                })
                                .where({
                                    user_id: sessionData.id
                                })
                                .then((isTotalAmountIncremented, err) => {
                                    if(err) return {
                                        statusCode: 500,
                                        response: false
                                    };
                                    else {
                                        if(isTotalAmountIncremented !== 0) return {
                                            statusCode: 200,
                                            response: true
                                        };
                                        else return{
                                            statusCode: 200,
                                            response: false
                                        };
                                    }
                                });
                            }
                            else return{
                                statusCode: 400,
                                response: false
                            };
                        };
                    });
                }

                else return {
                    // If cart is not found
                    statusCode: 404,
                    response: false
                };
            }
        });
    }
    else return {
        statusCode: 404,
        response: false
    };
};

/* 
    Decrement cart item
    Business Logic:
    1. Get the product ID and authenticated user ID.
    2. Find the product data from the cart data.
    3. If found, decrement the quantity and amount if the quantity is more than 1.
*/
module.exports.decrementCartItem = async (sessionData, productId) => {
    const product = await knex("products")
    .first()
    .where({
        id: productId
    })
    .then((data, err) => {
        if(err || data === undefined) return false;
        else return data;
    });

    if(product){
        return knex("user_carts")
        .first()
        .where({
            user_id: sessionData.id
        })
        .then((cart, err) => {
            if(err) return {
                statusCode: 500,
                response: false
            };
            else{
                if(cart !== undefined){
                    // If cart is found
                    return knex("cart_items")
                    .decrement({
                        product_quantity: 1,
                        product_subtotal: product.price
                    })
                    .where({
                        cart_id: cart.id,
                        product_id: productId,
                    })
                    .andWhere("product_quantity", ">", 1)
                    .then((isDecremented, err) => {
                        if(err) return {
                            statusCode: 500,
                            response: false
                        };
                        else{
                            if(isDecremented !== 0) {
                                return knex("user_carts")
                                .decrement({
                                    total_amount: product.price
                                })
                                .where({
                                    user_id: sessionData.id
                                })
                                .then((isDecreased, err) => {
                                    if(err) return {
                                        statusCode: 500,
                                        response: false
                                    };
                                    else{
                                        if(isDecreased !== 0) return{
                                            statusCode: 200,
                                            response: true
                                        };
                                        else return{
                                            statusCode: 200,
                                            response: false
                                        };
                                    }
                                });
                            }
                            else return {
                                statusCode: 404,
                                response: false
                            };
                        }
                    });
                }
                else return {
                    statusCode: 404,
                    response: false
                };
            }
        });
    }
    else return {
        statusCode: 404,
        response: false
    };
};

/* 
    Remove item in cart
    Business Logic:
    1. Get the product ID and authenticated user ID.
    2. Find the product data from the cart data.
    3. If found, remove the product data from the "cart_items" table
*/
module.exports.removeItemInCart = async (sessionData, productId) => {
    const product = await knex("products")
    .first()
    .where({
        id: productId
    })
    .then((data, err) => {
        if(err || data === undefined) return false;
        else return data;
    });

    if(product){
        const isTotalAmountDecreased = await knex("user_carts")
        .first()
        .where({
            user_id: sessionData.id
        })
        .then((cart, err) => {
            if(err || cart === undefined) return false;
            else{
                let subtotal = 0;
                return knex("cart_items")
                .first()
                .where({
                    product_id: productId,
                    cart_id: cart.id
                })
                .then((item, err) => {
                    if(err || item === undefined) return false;
                    else {
                        subtotal = item.product_subtotal;
                        return knex("user_carts")
                        .decrement({
                            total_amount: subtotal
                        })
                        .where({
                            user_id: cart.user_id
                        })
                        .then((saved, err) => {
                            if(err || saved === 0) return false;
                            else return true;
                        });
                    }
                });
            }
        });

        const isCartItemDeleted = await knex("user_carts")
        .first()
        .where({
            user_id: sessionData.id
        })
        .then((cart, err) => {
            if(err) return false;
            else{
                return knex("cart_items")
                .del()
                .where({
                    product_id: productId,
                    cart_id: cart.id
                })
                .then((deleted, err) => {
                    if(err || deleted === 0) return false;
                    else return true;
                })
            }
        });

        if(isTotalAmountDecreased && isCartItemDeleted) return {
            statusCode: 200,
            response: true
        };
        else return{
            statusCode: 200,
            response: false 
        };
    }
    else return {
        statusCode: 400,
        response: false
    };
};