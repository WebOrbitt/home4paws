import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import pool from '../src/config/database.js'
import { env } from '../src/config/env.js'

if (!env.adminEmail || !env.adminPassword) {
  throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env before seeding the admin account.')
}
if (env.adminPassword.length < 12) {
  throw new Error('ADMIN_PASSWORD must be at least 12 characters.')
}

try {
  const normalizedEmail = env.adminEmail.trim().toLowerCase()
  const [existing] = await pool.execute('SELECT id FROM users WHERE email_normalized = ? LIMIT 1', [normalizedEmail])
  const passwordHash = await bcrypt.hash(env.adminPassword, 12)
  if (existing[0]) {
    await pool.execute(
      "UPDATE users SET full_name = ?, mobile = '', password_hash = ?, role = 'ADMIN', account_status = 'Active' WHERE id = ?",
      [env.adminName, passwordHash, existing[0].id],
    )
    console.log(`Admin account updated for ${normalizedEmail}.`)
  } else {
    await pool.execute(
      "INSERT INTO users (id, full_name, email, email_normalized, password_hash, role) VALUES (?, ?, ?, ?, ?, 'ADMIN')",
      [randomUUID(), env.adminName, env.adminEmail.trim(), normalizedEmail, passwordHash],
    )
    console.log(`Admin account created for ${normalizedEmail}.`)
  }
} finally {
  await pool.end()
}
