var express = require('express');
var path = require('path');
var router = express.Router();
const typeController = require('../controllers/typeController');

router.use('/tracks', require('./track.js'));
router.get('/types', typeController.getTypes);

/* GET home page. */
router.use('/beatport', function(req, res) {
  res.sendFile(path.join(__dirname + '/../public/index.html'));
});

module.exports = router;
