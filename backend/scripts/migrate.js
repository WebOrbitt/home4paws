import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pool, { databaseFile } from '../src/config/database.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const schema = await fs.readFile(path.resolve(here, '../database/schema.sql'), 'utf8')
try {
  await pool.exec(schema)
  console.log(`Home4Paws SQLite tables are ready at ${databaseFile}.`)
} finally {
  await pool.end()
}
