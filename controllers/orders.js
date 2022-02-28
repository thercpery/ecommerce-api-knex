const knex = require("../db/config");
const auth = require("../auth");

/* 
    View all orders from authenticated user
    Business Logic:
    1. Get all the orders from the authenticated user.
    2. Return the data.
*/
module.exports.viewOrdersFromUser = async (sessionData) => {
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
    orderData.map( order => {
        order.items = knex
        .select()
        .from("order_items")
        .where({
            order_id: order.id
        })
        .then((items, err) => (err) ? [] : items);
    });
    return {
        statusCode: 200,
        response: orderData
    };
};

/* 
    Order a product
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
                            product_price: productData.price
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
    return knex
    .select()
    .from("orders")
    .join("order_items", {
        "order_items.order_id": "orders.id"
    })
    .then((orders, err) => {
        if(err) return {
            statusCode: 500,
            response: false
        };
        else{
            if(sessionData.is_admin) return {
                statusCode: 200,
                response: orders
            };
            else return {
                statusCode: 401,
                response: false
            };
        }
    });
};