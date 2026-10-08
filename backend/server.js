const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const erpRoutes = require('./routes/erpRoutes')

const app = express()
const port = process.env.PORT || 5000
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/collegeDB'

app.set('mongooseConnection', mongoose.connection)
app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(erpRoutes)
app.use('/api', erpRoutes)

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} was not found.` }))

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error)
  if (error.code === 11000) {
    return res.status(400).json({ success: false, message: 'A record with this unique value already exists.' })
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: error.message })
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'The supplied identifier is invalid.' })
  }
  console.error(error)
  return res.status(500).json({ success: false, message: 'An unexpected server error occurred.' })
})

async function startServer() {
  await mongoose.connect(mongoUri)
  app.set('mongooseConnection', mongoose.connection)
  console.log('MongoDB connected')
  app.listen(port, () => console.log(`Campusdesk API running on http://localhost:${port}`))
}

startServer().catch((error) => {
  console.error('Unable to connect to MongoDB:', error.message)
  process.exit(1)
})

module.exports = app