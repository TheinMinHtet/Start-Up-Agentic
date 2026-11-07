import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username?.trim() || cleanEmail.split('@')[0];

    // Check if user or username exists
    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.email, cleanEmail), eq(users.username, cleanUsername)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'A user with this email or username already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        email: cleanEmail,
        username: cleanUsername,
        name: cleanUsername,
        passwordHash,
      })
      .returning({ id: users.id, email: users.email, username: users.username });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to register account.' },
      { status: 500 }
    );
  }
}
