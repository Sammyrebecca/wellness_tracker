const express = require('express');
const router = express.Router();
const { create, list, update, remove } = require('../controllers/entry.controller');
const { auth } = require('../middlewares/auth');

router.post('/', auth, create);
router.get('/', auth, list);
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);

module.exports = router;
