const express = require('express');
const router = express.Router();
const { login, register, logout } = require('../controllers/authControllers')
const { auth, callback } = require('../controllers/googleAuthController')

router.get('/auth/google', auth)
router.get('/auth/google/callback', callback)

router.get("/logout", logout)
router.post("/users", register)
router.post("/login", login)

module.exports = router;

