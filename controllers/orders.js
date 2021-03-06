const knex = require("../db/config");
const auth = require("../auth");

/* 
    View all orders from authenticated user
    Business Logic:
    1. Get all the orders from the authenticated user.
    2. Return the data.
*/
module.exports.viewOrdersFromUser = async (sessionData) => {
    // Fill order data
    let orderData = await knex
    .select()
    .from("orders")
    .where({
        user_id: sessionData.id
    })
    .then((orders, err) => {
        if(err) return false;
        else return orders;
    });

    // Fill order items
    let orderItems = await knex
    .select("id", "order_id", "product_id", "product_name", "product_quantity", "product_price", "product_subtotal")
    .from("order_items")
    .then((items, err) => {
        if(err) return false;
        else return items;
    });

    // Iterate all items
    orderData.map(order => {
        order.items = [];
        orderItems.map(item => {
            if(item.order_id === order.id) order.items.push(item);
        });
    });

    return {
        statusCode: 200,
        response: orderData
    };
};

/* 
    Order a single product
    Business Logic:
    1. Gather the product information by product ID.
    2. Check if the item is in stock/active or not. If item not in stock, return false.
    3. If in stock, create the order data and compute the total price with the quantity.
    4. Once the order is saved, create the "order_items" data that contains the order ID and the product ID.
    NOTE: admin is not allowed to order.

*/
module.exports.orderProduct = async (sessionData, orderItems) => {
    let totalAmount = 0;
    let productData;
    const isProductInStock = 
    await knex("products")
    .first()
    .where({ 
        id: orderItems.productId
    })
    .then((product, err) => {
        if(err) return false;
        else{
            if(product !== undefined && product.is_active) {
                totalAmount = orderItems.quantity * product.price;
                productData = product;
                return true;
            }
            else return false;
        }
    });
    if(isProductInStock){
        if(!sessionData.is_admin){
            // If authenticated user is not an admin
            const isOrderCreated = await knex("orders")
            .insert({
                user_id: sessionData.id,
                total_amount: totalAmount
            })
            .then((saved, err) => {
                if(err) return false;
                else{
                    if(saved !== 0) return true;
                    else return false;
                }
            });
            const isOrderItemsCreated = await knex
            .select()
            .from("orders")
            .where({
                user_id: sessionData.id
            })
            .then((order, err) => {
                if(err) return false;
                else{
                    if(order.length !== 0){
                        return knex("order_items")
                        .insert({
                            order_id: order[order.length - 1].id,
                            product_id: productData.id,
                            product_name: productData.name,
                            product_quantity: orderItems.quantity,
                            product_price: productData.price,
                            product_subtotal: orderItems.quantity * productData.price
                        })
                        .then((saved, err) => {
                            if(err || saved === 0) return false;
                            else return true;
                        })
                    }
                    else{
                        return false;
                    }
                }
            });
            if(isOrderCreated && isOrderItemsCreated) return {
                statusCode: 201,
                response: true
            };
            else return {
                statusCode: 403,
                response: false
            };
        }
        else return {
            // If authenticated user is an admin.
            statusCode: 401,
            response: false
        };
    }
    else return {
        statusCode: 403,
        response: false
    };
};

/* 
    View all orders
    Business Logic:
    1. Check if the authenticated user is an admin. If not return false.
    2. If it is an admin, return all the order data.
*/
module.exports.viewAllOrders = async (sessionData) => {
    if(!sessionData.is_admin) return {
        statusCode: 500,
        response: false
    };

    let orderData = await knex
    .select()
    .from("orders")
    .then((orders, err) => {
        if(err) return false;
        else return orders;
    });

    let orderItems = await knex
    .select("id", "order_id", "product_id", "product_name", "product_quantity", "product_price", "product_subtotal")
    .from("order_items")
    .then((items, err) => {
        if(err) return false;
        else return items;
    });

    let userData = await knex
    .select("id", "email")
    .from("users")
    .then((users, err) => {
        if(err) return false;
        else return users;
    });


    orderData.map(order => {
        const user = userData.filter(user => user.id === order.user_id)[0];
        order.user_email = user.email;
        order.items = [];
        orderItems.map(item => {
            if(item.order_id === order.id) order.items.push(item);
        });
    });

    
    return {
        statusCode: 200,
        response: orderData
    };
};

/* 
    Checkout items from cart
    Business Logic:
    1. Get the cart data from the cart_items and user_carts table that matches the authenticated user ID. If empty return false.
    2. Create the order data.
    3. Find the newly-created order data and for every item in the cart save them into the order_items table.
*/
module.exports.checkoutFromCart = async (sessionData) => {
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
        const cartData = await knex("user_carts")
        .first()
        .where({
            user_id: sessionData.id
        })
        .then(cart => cart);
        
        const cartItemsData = await knex
        .select()
        .from("cart_items")
        .where({
            cart_id: cartData.id
        })
        .then(items => items);

        const isOrderCreated = await knex("orders")
        .insert({
            user_id: sessionData.id,
            total_amount: cartData.total_amount
        })
        .then((saved, err) => {
            if(err || saved === 0) return false;
            else return true;
        });

        const isOrderItemsCreated = await knex
        .select()
        .from("orders")
        .where({
            user_id: sessionData.id
        })
        .then((order, err) => {
            if(err || order.length === 0) return false;
            else{
                let areItemsSaved = false;
                cartItemsData.map(item => {
                    areItemsSaved = knex("order_items")
                    .insert({
                        order_id: order[order.length - 1].id,
                        product_id: item.product_id,
                        product_name: item.product_name,
                        product_quantity: item.product_quantity,
                        product_price: item.product_price,
                        product_subtotal: item.product_subtotal
                    })
                    .then((saved , err) => {
                        if(err) return false;
                        else return true;
                    });
                });
                return areItemsSaved;
            }
        });

        // Clear cart and cart items
        const isCartItemsCleared = await knex("cart_items")
        .del()
        .where({
            cart_id: cartData.id
        })
        .then((isDeleted, err) => {
            if(err || isDeleted === 0) return false;
            else return true;
        });

        const isCartDeleted = await knex("user_carts")
        .del()
        .where({
            id: cartData.id
        })
        .then((isDeleted, err) => {
            if(err || isDeleted === 0) return false;
            else return true;
        });
        if(
            isOrderCreated &&
            isOrderItemsCreated &&
            isCartItemsCleared &&
            isCartDeleted
        ) return{
            statusCode: 200,
            response: true
        };
        else return{
            statusCode: 200,
            response: false
        };
    }
    else return{
        statusCode: 400,
        response: false
    };
};

/* 
    TODO:
    1. Hot products/featured products section within the past 30 days.
    2. Refactor code with quantity column.
*/