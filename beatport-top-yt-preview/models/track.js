'use strict';

const logger = require('../utils/logger');

module.exports = (sequelize, DataTypes) => {
  const Track = sequelize.define('top_track', {
    num: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    type: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING
    },
    title: {
      allowNull: false,
      type: DataTypes.STRING
    },
    artists: {
      allowNull: false,
      type: DataTypes.STRING
    },
    remixers: DataTypes.STRING,
    labels: DataTypes.STRING,
    genre: DataTypes.STRING,
    released: DataTypes.DATEONLY,
    link: {
      allowNull: false,
      type: DataTypes.STRING
    },
    imglink: DataTypes.TEXT,
    video_id: DataTypes.STRING
    // Auto-generated by sequelize
    // created_at: {allowNull: false, type: DataTypes.DATE}
    // updated_at: {allowNull: false, type: DataTypes.DATE}
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  /**
   * Get tracks by type
   * @param {string} type
   * @param {string[]|Object} [attributes]
   * @returns {Promise<Object[]>}
   */
  Track.getByType = (type, attributes) => {
    let options = {
      where: {
        type: type,
        num: {
          [sequelize.Op.between]: [1, 100]
        }
      },
      order: [['num', 'ASC']],
      logging: logger.info
    };

    if (attributes) {
      options.attributes = attributes;
    }

    return Track.findAll(options);
  };

  /**
   * Update or Insert tracks
   * @param {Object[]} tracks
   */
  Track.upsert = (tracks) => {
    return Track.bulkCreate(tracks, {
      updateOnDuplicate: [],
      logging: logger.info
    });
  };

  /**
   * @typedef {Object} TypeObject
   * @property {string} type The type
   */
  /**
   * Get array of distinct type objects
   * @returns {Promise<TypeObject[]>}
   */
  Track.getTypes = () => {
    return sequelize.query(
      'SELECT DISTINCT type ' + 
        'FROM top_tracks ' + 
       'ORDER BY ' +
             'CASE ' + 
                   'WHEN type = \'top100\' THEN 1 ' +
                   'ELSE 2 ' + 
             'END ASC, ' + 
             'type ASC;',
      {replacements: {}, type: sequelize.QueryTypes.SELECT, logging: logger.info});
  };

  Track.associate = () => {
    // associations can be defined here
  };
  return Track;
};