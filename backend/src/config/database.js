import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { env } from './env.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const backendRoot = path.resolve(here, '../..')
export const databaseFile = path.resolve(backendRoot, env.dbFile || '.runtime/home4paws.sqlite')

fs.mkdirSync(path.dirname(databaseFile), { recursive: true })

const database = new Database(databaseFile)
database.pragma('foreign_keys = ON')
database.pragma('journal_mode = WAL')
database.pragma('busy_timeout = 5000')

const normalizeSql = (sql) => sql
  .replace(/\bUTC_TIMESTAMP\(\)/gi, 'CURRENT_TIMESTAMP')
  .replace(/\s+FOR UPDATE\b/gi, '')

const normalizeValue = (value) => {
  if (value === undefined || value === null) return null
  if (value instanceof Date) return value.toISOString().slice(0, 19).replace('T', ' ')
  if (typeof value === 'boolean') return value ? 1 : 0
  return value
}

class SqliteConnection {
  async getConnection() {
    return this
  }

  async all(sql, values = []) {
    const [rows] = await this.execute(sql, values)
    return rows
  }

  async execute(sql, values = []) {
    const statement = database.prepare(normalizeSql(sql))
    const parameters = values.map(normalizeValue)
    if (statement.reader) return [statement.all(...parameters)]

    const result = statement.run(...parameters)
    return [{
      affectedRows: result.changes,
      insertId: Number(result.lastInsertRowid),
    }]
  }

  async query(sql, values = []) {
    return this.execute(sql, values)
  }

  async beginTransaction() {
    database.exec('BEGIN IMMEDIATE')
  }

  async commit() {
    database.exec('COMMIT')
  }

  async rollback() {
    if (database.inTransaction) database.exec('ROLLBACK')
  }

  release() {}

  async end() {
    if (database.open) database.close()
  }

  async exec(sql) {
    database.exec(sql)
  }
}

const connection = new SqliteConnection()

export default connection
