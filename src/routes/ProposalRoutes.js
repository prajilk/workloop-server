const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const { createProposal, getProposalById, getProposals } = require('../controllers/ProposalController');
const router = express.Router();

router.post('/', verifyToken, createProposal)
router.get('/', verifyToken, getProposals)
router.get('/:workId', verifyToken, getProposalById)

module.exports = router;