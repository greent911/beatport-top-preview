const express = require('express');
const trackController = require('../controllers/trackController');

const router = express.Router();

router.get('/:type', trackController.getTracks);
router.get('/', trackController.getTracks);

module.exports = router;
