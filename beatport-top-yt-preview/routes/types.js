var express = require('express');
var router = express.Router();
const typeController = require('../controllers/typeController');

router.get('/', typeController.getTypes);

module.exports = router;
