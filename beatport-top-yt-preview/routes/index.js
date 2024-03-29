'use strict';

const express = require('express');
const path = require('path');

const router = express.Router();

router.use('/api/tracks', require('./tracks.js'));
router.use('/api/types', require('./types.js'));

/* GET home page. */
router.use('/beatport', (req, res) => {
  res.sendFile(path.join(__dirname + '/../public/index.html'));
});

module.exports = router;
