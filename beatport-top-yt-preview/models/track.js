'use strict';

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
  }, {});
  Track.associate = function() {
    // associations can be defined here
  };
  return Track;
};