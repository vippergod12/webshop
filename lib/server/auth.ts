import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sql } from "./db";
import type { AdminUser } from "@/lib/types";

const TOKEN_TTL = "7d";

export type JwtPayload = { sub: number; username: string };

function getSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) {
    throw new Error("Missing JWT_SECRET in .env (>= 32 random chars).");
  }
  return s;
}

export function signToken(user: AdminUser): string {
  return jwt.sign({ sub: user.id, username: user.username }, getSecret(), {
    expiresIn: TOKEN_TTL,
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret());
    if (typeof decoded === "string") return null;
    return {
      sub: Number((decoded as any).sub),
      username: String((decoded as any).username),
    };
  } catch {
    return null;
  }
}

export async function authenticateAdmin(
  username: string,
  password: string
): Promise<AdminUser | null> {
  const rows = (await sql`
    SELECT id, username, password_hash FROM admins WHERE username = ${username} LIMIT 1
  `) as Array<{ id: number; username: string; password_hash: string }>;
  if (!rows.length) return null;
  const ok = await bcrypt.compare(password, rows[0].password_hash);
  if (!ok) return null;
  return { id: rows[0].id, username: rows[0].username };
}

export function getBearerToken(req: Request): string | null {
  const h = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

export function requireAdmin(req: Request): JwtPayload | Response {
  const token = getBearerToken(req);
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return payload;
}
