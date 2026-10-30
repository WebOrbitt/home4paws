import { assertProductionSecrets, env } from './config/env.js'
import app from './app.js'

assertProductionSecrets()
const server = app.listen(env.port, '0.0.0.0', () => {
  console.log(`Home4Paws API listening on http://localhost:${env.port}`)
})

function shutdown(signal) {
  console.log(`${signal} received; stopping API server.`)
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
