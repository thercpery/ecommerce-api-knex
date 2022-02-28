/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .createTable("products", table => {
        table.increments("id").primary();
        table.string("name").notNullable();
        table.text("description").notNullable();
        table.float("price").notNullable();
        table.boolean("is_active").defaultTo(true);
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .createTable("users", table => {
        table.increments("id").primary();
        table.string("email").notNullable();
        table.string("password").notNullable();
        table.boolean("is_admin").defaultTo(false);
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .createTable("orders", table => {
        table.increments("id").primary();
        table.integer("user_id").notNullable().references("id").inTable("users");
        table.float("total_amount").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .createTable("order_items", table => {
        table.increments("id").primary();
        table.integer("order_id").notNullable().references("id").inTable("orders");
        table.integer("product_id").notNullable().references("id").inTable("products");
        table.string("product_name").notNullable();
        table.integer("product_quantity").notNullable();
        table.float("product_price").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .createTable("user_carts", table => {
        table.increments("id").primary();
        table.integer("user_id").notNullable().references("id").inTable("users");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .createTable("cart_items", table => {
        table.increments("id").primary();
        table.integer("cart_id").notNullable().references("id").inTable("user_carts");
        table.integer("product_id").notNullable().references("id").inTable("products");
        table.string("product_name").notNullable();
        table.integer("product_quantity").notNullable();
        table.float("product_price").notNullable();
        table.float("product_subtotal").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
    .dropTableIfExists("cart_items")
    .dropTableIfExists("user_carts")
    .dropTableIfExists("order_items")
    .dropTableIfExists("orders")
    .dropTableIfExists("users")
    .dropTableIfExists("products");
};
