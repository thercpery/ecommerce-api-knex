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
module.exports.getProfile = (sessionData) => {
    return knex
    .select("id", "email", "is_admin", "created_at", "updated_at")
    .from("users")
    .where({
        id: sessionData.id
    })
    .then((user, err) => {
        if(err){
            return {
                statusCode: 500,
                response: false
            };
        }
        else{
            if(user.length !== 0){
                return {
                    statusCode: 200,
                    response: user
                };
            }
            else{
                return {
                    statusCode: 404,
                    response: false
                };
            }
        }
    });
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