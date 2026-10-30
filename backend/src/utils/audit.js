export async function writeAudit(connection, actorId, action, entityType, entityId, details = null) {
  await connection.execute(
    'INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
    [actorId || null, action, entityType, entityId, details ? JSON.stringify(details) : null],
  )
}
