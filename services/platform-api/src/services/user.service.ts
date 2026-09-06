import pool from "../config/database/db.config";
import { hashPassword } from "../utils/bcrypt.util";

export async function userEmailRegisterService(
  email: string,
  name: string,
  password: string,
  deviceId?: string,
  ip?: string,
  fingerprint?: string,
) {
  const client = await pool.connect();
  try {
    const identityCheck = await client.query(
      `SELECT COUNT(*) FROM users 
       WHERE (device_id = $1 AND $1 != 'none') OR (last_ip = $2 AND $2 != 'none') OR (fingerprint = $3 AND $3 != 'none')`,
      [deviceId || 'none', ip || 'none', fingerprint || 'none']
    );

    if (parseInt(identityCheck.rows[0].count, 10) >= 2) {
      throw new Error("Maximum accounts per identity reached. BulkParser allows only 2 accounts per user.");
    }

    const passwordHash = await hashPassword(password);

    await client.query("BEGIN");

    const insertUserResult = await client.query(
      `INSERT INTO users (email, name, device_id, last_ip, fingerprint)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [email, name, deviceId, ip, fingerprint],
    );

    const userId = insertUserResult.rows[0].id;

    const insertAuthProviderResult = await client.query(
      `INSERT INTO auth_providers (user_id, provider, provider_id, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [userId, "email", email, passwordHash],
    );

    await client.query("COMMIT");

    return insertAuthProviderResult.rows[0].id;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return null;
  } finally {
    client.release();
  }
}

export async function getUserByEmail(email: string) {
  const client = await pool.connect();
  try {
    const query = `
      SELECT
        u.id,
        u.name,
        u.email,
        ap.password_hash
      FROM public.users u
      JOIN public.auth_providers ap ON u.id = ap.user_id
      WHERE u.email = $1
      LIMIT 1;
    `;

    const result = await client.query(query, [email]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function getUserByID(id: string) {
  const client = await pool.connect();
  try {
    const query = `
      SELECT
        u.id,
        u.email,
        u.name,
        ap.password_hash
      FROM public.users u
      JOIN public.auth_providers ap ON u.id = ap.user_id
      WHERE u.id = $1
      LIMIT 1;
    `;

    const result = await client.query(query, [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function upsertGoogleUser(
  email: string,
  name: string,
  googleId: string,
  deviceId?: string,
  ip?: string,
  fingerprint?: string,
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Check if user exists
    const userRes = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    let userId: string;

    if (userRes.rows.length > 0) {
      // User exists
      userId = userRes.rows[0].id;
      // Update last IP and fingerprint
      await client.query(
        "UPDATE users SET last_ip = $1, fingerprint = $2 WHERE id = $3",
        [ip, fingerprint, userId]
      );
    } else {
      // Check identity limit
      const identityCheck = await client.query(
        `SELECT COUNT(*) FROM users 
         WHERE (device_id = $1 AND $1 != 'none') OR (last_ip = $2 AND $2 != 'none') OR (fingerprint = $3 AND $3 != 'none')`,
        [deviceId || 'none', ip || 'none', fingerprint || 'none']
      );

      if (parseInt(identityCheck.rows[0].count, 10) >= 2) {
        throw new Error("Maximum accounts per identity reached. BulkParser allows only 2 accounts per user.");
      }

      // Create User
      const insertUser = await client.query(
        `INSERT INTO users (email, name, device_id, last_ip, fingerprint) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [email, name, deviceId, ip, fingerprint]
      );
      userId = insertUser.rows[0].id;
    }

    // 2. Ensure Auth Provider exists
    // Check if this google account is linked
    const authRes = await client.query(
      `SELECT * FROM auth_providers WHERE user_id = $1 AND provider = 'google'`,
      [userId]
    );

    if (authRes.rows.length === 0) {
      // Link Google Account
      await client.query(
        `INSERT INTO auth_providers (user_id, provider, provider_id)
         VALUES ($1, 'google', $2)`,
        [userId, googleId]
      );
    }

    await client.query("COMMIT");

    // ... existing code ...

    return { id: userId, email, name };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in upsertGoogleUser:", error);
    throw error;
  } finally {
    client.release();
  }
}

export async function updateUserProfileService(userId: string, name: string) {
  const client = await pool.connect();
  try {
    const query = `
      UPDATE users 
      SET name = $1 
      WHERE id = $2 
      RETURNING id, name, email
    `;
    const result = await client.query(query, [name, userId]);
    return result.rows[0];
  } finally {
    client.release();
  }
}

