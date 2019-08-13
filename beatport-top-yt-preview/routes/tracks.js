var express = require('express');
var router = express.Router();
const trackController = require('../controllers/trackController');

router.get('/:type', trackController.getTracks);
router.get('/', trackController.getTracks);

module.exports = router;
