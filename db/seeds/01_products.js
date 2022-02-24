/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('products').del()
  await knex('products').insert([
    {
      id: 1, 
      name: 'Samsung Galaxy S5',
      description: 'An old but sturdy phone',
      price: 2500
    },
    {
      id: 2, 
      name: 'Nintondo Switch',
      description: 'Competitor of PS4',
      price: 5000
    },
    {
      id: 3, 
      name: 'PS3',
      description: 'Second-hand',
      price: 1000
    },
    {
      id: 4, 
      name: 'Sennheiser HD 400 PRO',
      description: 'Noise-cancelling headphones',
      price: 8000
    },
    {
      id: 5, 
      name: 'Keychron C1 Keyboard',
      description: 'A reliable mechanical keyboard for typing enthusiasts',
      price: 3190.95
    },
    {
      id: 6, 
      name: 'ASUS TUF Gaming K3 RGB MECHANICAL Blue Switch KEYBOARD',
      description: 'For gamers by gamers',
      price: 3495.00
    },
    {
      id: 7, 
      name: 'Logitech G413 Carbon Mechanical Backlit Gaming Keyboard',
      description: 'For gamers by gamers',
      price: 3620
    },
    {
      id: 8, 
      name: 'Sony WH-1000XM4',
      description: 'High-quality, industry-leading noise-cancelling headphones by Sony',
      price: 14999.99
    },
    {
      id: 9, 
      name: 'AMD Ryzen 5',
      description: 'Processor for gaming',
      price: 6650
    },
    {
      id: 10, 
      name: 'AMD Ryzen 5 3600',
      description: 'Serious Gaming. Fully Unlocked',
      price: 13650.99
    },
    {
      id: 11, 
      name: 'Toshiba 1TB 5400RPM 7MM 128MB SATA (L200) MOBILE HARD DRIVE',
      description: 'Big upgrade if you want a hard drive',
      price: 2200
    },
    {
      id: 12, 
      name: 'Logitech G431 Gaming Headset with 7.1 DTS Headphone:X 2.0 surround sound',
      description: 'For gaming',
      price: 3300
    },
    {
      id: 13, 
      name: 'Logitech Tab M10 HD 4GB+64GB Iron Gray Tablet (ZA6V0105PH)',
      description: 'Lenovo Tablet',
      price: 1000
    }
  ]);

  await knex.raw("select setval('products_id_seq', max(products.id)) from products");
};
