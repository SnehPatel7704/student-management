const express = require('express')
const controller = require('../controllers/authController')
const { authenticate } = require('../middleware/authenticate')

const router = express.Router()
router.post('/login', controller.login)
router.get('/me', authenticate, controller.me)
router.get('/dev-options', authenticate, controller.getDevelopmentOptions)
router.post('/dev-role', authenticate, controller.switchDevelopmentRole)

module.exports = router