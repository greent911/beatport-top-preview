var express = require('express');
var path = require('path');
var router = express.Router();

router.use('/tracks', require('./tracks.js'));
router.use('/types', require('./types.js'));

/* GET home page. */
router.use('/beatport', function(req, res) {
  res.sendFile(path.join(__dirname + '/../public/index.html'));
});

/* Allow Google robots to crawl your site */
router.use('/robots.txt', function(req, res) {
  res.sendFile(path.join(__dirname + '/../views/robots.txt'));
});

module.exports = router;
