const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const { createPortfolio, getAllPortfolios, deletePortfolio } = require('../controllers/PortfolioController');
const router = express.Router();

router.get('/', verifyToken, getAllPortfolios)
router.post('/', verifyToken, createPortfolio);
router.delete('/:projectId', verifyToken, deletePortfolio);

module.exports = router;