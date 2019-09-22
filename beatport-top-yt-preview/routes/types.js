const express = require('express');
const typeController = require('../controllers/typeController');

const router = express.Router();

router.get('/', typeController.getTypes);

module.exports = router;
