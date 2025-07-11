'use strict';

const { faker } = require('@faker-js/faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const counties = ['Nairobi', 'Kiambu', 'Nakuru', 'Mombasa', 'Machakos'];
    const occupations = ['Teacher', 'Farmer', 'Boda Boda', 'Accountant', 'Nurse'];

    const members = Array.from({ length: 500 }).map(() => {
      return {
        full_name: faker.person.fullName(),
gender: faker.person.sexType(),
dob: faker.date.between({ from: '1964-01-01', to: '2004-12-31' }),
county: faker.helpers.arrayElement(counties),
occupation: faker.helpers.arrayElement(occupations),
joined_at: faker.date.between({ from: '2015-01-01', to: '2025-01-01' }),
phone: faker.phone.number('+2547#######'),
email: faker.internet.email(),

      };
    });

    await queryInterface.bulkInsert('Members', members, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Members', null, {});
  }
};
