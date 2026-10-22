const express = require('express')
const controller = require('../controllers/userController')
const { authenticate, authorize } = require('../middleware/authenticate')

const router = express.Router()
router.use(authenticate, authorize('users.manage'))
router.get('/', controller.list)
router.post('/', controller.create)
router.put('/:id', controller.update)
router.delete('/:id', controller.remove)

module.exports = router