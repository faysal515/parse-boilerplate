const express = require('express')
const config = require('config')
const http = require('http')
const path = require('path')
const { ParseServer, logger } = require('parse-server')
const ParseDashboard = require('parse-dashboard')

const {
  PORT, MONGODB_URI, appId, masterKey, dashboardUser, dashboardPassword
} = config.get('parse')

if (!MONGODB_URI) {
  console.log('MONGODB_URI not specified, system exiting ...')
  process.exit(0)
}

if (process.env.NODE_ENV === 'production') {
  // @todo work on custom logger to remove console transport
  // logger.adapter.removeTransport('console')
}

const api = new ParseServer({
  databaseURI: MONGODB_URI,
  cloud: `${__dirname}/src/cloud/main.js`,
  appId,
  masterKey,
  serverURL: process.env.PARSE_SERVER_URL
})


const dashboard = new ParseDashboard({
  apps: [
    {
      serverURL: process.env.PARSE_SERVER_URL,
      appId,
      masterKey,
      appName: 'Parse-v3.0'
    }
  ],
  users: [
    {
      user: dashboardUser,
      pass: dashboardPassword,
      apps: [{ appId }]
    }],
})

const app = express()

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')))

app.use('/parse', api)
app.use('/dashboard', dashboard)

const httpServer = http.createServer(app)

httpServer.listen(PORT, () => {
  console.log(`parse-server-example running on port ${PORT}`)
})
