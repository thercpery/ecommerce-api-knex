/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const bcrypt = require("bcrypt");
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del()
  await knex('users').insert([
    {
      id: 1,
      email: 'admin@admin.com',
      password: bcrypt.hashSync("admin", 10),
      is_admin: true
    },
    {
      id: 2,
      email: 'rcpery@something.com',
      password: bcrypt.hashSync("rc1234", 10)
    },
    {
      id: 3,
      email: 'loremipsum@something.com',
      password: bcrypt.hashSync("lorem1234", 10)
    },
    {
      id: 4,
      email: 'jondoe@something.com.com',
      password: bcrypt.hashSync("jondoe", 10)
    },
    {
      id: 5,
      email: 'janedoe@something.com.com',
      password: bcrypt.hashSync("janedoe", 10)
    },
    {
      id: 6,
      email: 'bossperymapagmahal@something.com',
      password: bcrypt.hashSync("yie", 10)
    },
    {
      id: 7,
      email: 'pika@pikachu.com',
      password: bcrypt.hashSync("ichooseyou", 10)
    },
    {
      id: 8,
      email: 'sherlockholdmes@something.com',
      password: bcrypt.hashSync("iamsherlock", 10)
    },
    {
      id: 9,
      email: 'hello@ikea.com',
      password: bcrypt.hashSync("ikea", 10),
      is_admin: true
    },
    {
      id: 10,
      email: 'hello@cs.com',
      password: bcrypt.hashSync("haha", 10),
      is_admin: true
    },
    {
      id: 11,
      email: 'rcpery@email.com',
      password: bcrypt.hashSync("qqq", 10)
    },
    {
      id: 12,
      email: 'goodbye@world.com',
      password: bcrypt.hashSync("hello", 10)
    },
    {
      id: 13,
      email: 'jingdelacruz@email.com',
      password: bcrypt.hashSync("yow", 10)
    },
    {
      id: 14,
      email: 'vida@vida.com',
      password: bcrypt.hashSync("vida", 10),
      is_admin: true
    },
    {
      id: 15,
      email: 'bossroy@mail.com',
      password: bcrypt.hashSync("hello", 10)
    },
    {
      id: 16,
      email: 'iamjohndope@mail.com',
      password: bcrypt.hashSync("johndope", 10)
    }
  ]);

  await knex.raw("select setval('users_id_seq', max(users.id)) from users");
};
