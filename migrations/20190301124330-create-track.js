'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('top_tracks', {
      num: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING
      },
      artists: {
        allowNull: false,
        type: Sequelize.STRING
      },
      remixers: {
        type: Sequelize.STRING
      },
      labels: {
        type: Sequelize.STRING
      },
      genre: {
        type: Sequelize.STRING
      },
      released: {
        type: Sequelize.DATEONLY
      },
      link: {
        allowNull: false,
        type: Sequelize.STRING
      },
      imglink: {
        type: Sequelize.STRING
      },
      video_id: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('top_tracks');
  }
};