import * as argon2 from '@node-rs/argon2';
import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';
import { eq, and } from 'drizzle-orm';
import { db, type AppDatabase } from '../db/client';
import { users, refreshTokens, accounts, rules } from '../db/schema';
import type { RegisterInput, LoginInput, User } from '@vault-ledger/shared';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-must-be-at-least-32-chars-long-for-hs256!',
);
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_DAYS = 30;

export interface TokenPayload {
  userId: string;
  email: string;
  isDemo: boolean;
}

export class AuthService {
  constructor(private database: AppDatabase = db) {}

  async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);
  }

  async verifyPassword(hash: string, password: string): Promise<boolean> {
    return await argon2.verify(hash, password);
  }

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.userId)
      .setIssuedAt()
      .setExpirationTime(ACCESS_TOKEN_TTL)
      .sign(JWT_SECRET);
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.sub as string,
      email: payload['email'] as string,
      isDemo: Boolean(payload['isDemo']),
    };
  }

  async createRefreshToken(userId: string): Promise<string> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    await this.database.insert(refreshTokens).values({
      userId,
      tokenHash,
      expiresAt,
    });

    return rawToken;
  }

  async rotateRefreshToken(rawToken: string): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const [tokenRecord] = await this.database
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.tokenHash, tokenHash), eq(refreshTokens.revoked, false)));

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    // Revoke old token
    await this.database
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.id, tokenRecord.id));

    // Get user
    const [userRecord] = await this.database
      .select()
      .from(users)
      .where(eq(users.id, tokenRecord.userId));

    if (!userRecord) {
      throw new Error('User not found');
    }

    const payload: TokenPayload = {
      userId: userRecord.id,
      email: userRecord.email,
      isDemo: userRecord.isDemo,
    };

    const newAccessToken = await this.generateAccessToken(payload);
    const newRefreshToken = await this.createRefreshToken(userRecord.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        firstName: userRecord.firstName,
        lastName: userRecord.lastName,
        isDemo: userRecord.isDemo,
        createdAt: userRecord.createdAt.toISOString(),
        updatedAt: userRecord.updatedAt.toISOString(),
      },
    };
  }

  /**
   * Registers a new user and creates default ledger accounts and rules.
   */
  async register(input: RegisterInput): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const existing = await this.database.select().from(users).where(eq(users.email, input.email.toLowerCase()));
    if (existing.length > 0) {
      throw new Error('A user with this email already exists');
    }

    const passwordHash = await this.hashPassword(input.password);

    return await this.database.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(users)
        .values({
          email: input.email.toLowerCase(),
          passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
          isDemo: false,
        })
        .returning();

      if (!newUser) {
        throw new Error('User creation failed');
      }

      // Initialize default core accounts
      const [checking] = await tx
        .insert(accounts)
        .values({
          userId: newUser.id,
          name: 'Vault Checking',
          type: 'depository',
          currency: 'USD',
        })
        .returning();

      const [vault] = await tx
        .insert(accounts)
        .values({
          userId: newUser.id,
          name: 'Savings Vault',
          type: 'vault',
          currency: 'USD',
        })
        .returning();

      await tx.insert(accounts).values([
        {
          userId: newUser.id,
          name: 'Reserve Credit',
          type: 'credit',
          currency: 'USD',
        },
        {
          userId: newUser.id,
          name: 'External Counterparty',
          type: 'counterparty',
          currency: 'USD',
        },
      ]);

      // Initialize default round-up rule
      if (checking && vault) {
        await tx.insert(rules).values({
          userId: newUser.id,
          name: 'Spare Change Round-Up',
          type: 'round_up',
          enabled: true,
          config: {
            sourceAccountId: checking.id,
            destinationAccountId: vault.id,
            multiplier: 1,
          },
        });
      }

      const payload: TokenPayload = {
        userId: newUser.id,
        email: newUser.email,
        isDemo: newUser.isDemo,
      };

      const accessToken = await this.generateAccessToken(payload);
      const refreshToken = await this.createRefreshToken(newUser.id);

      const userModel: User = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isDemo: newUser.isDemo,
        createdAt: newUser.createdAt.toISOString(),
        updatedAt: newUser.updatedAt.toISOString(),
      };

      return {
        user: userModel,
        accessToken,
        refreshToken,
      };
    });
  }

  async login(input: LoginInput): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const [userRecord] = await this.database
      .select()
      .from(users)
      .where(eq(users.email, input.email.toLowerCase()));

    if (!userRecord) {
      throw new Error('Invalid email or password');
    }

    const isValid = await this.verifyPassword(userRecord.passwordHash, input.password);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const payload: TokenPayload = {
      userId: userRecord.id,
      email: userRecord.email,
      isDemo: userRecord.isDemo,
    };

    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.createRefreshToken(userRecord.id);

    return {
      user: {
        id: userRecord.id,
        email: userRecord.email,
        firstName: userRecord.firstName,
        lastName: userRecord.lastName,
        isDemo: userRecord.isDemo,
        createdAt: userRecord.createdAt.toISOString(),
        updatedAt: userRecord.updatedAt.toISOString(),
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * One-click demo session: returns or creates a seeded demo user.
   */
  async getOrCreateDemoUser(): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const demoEmail = 'demo@vaultledger.local';
    const [existing] = await this.database.select().from(users).where(eq(users.email, demoEmail));

    if (existing) {
      const payload: TokenPayload = {
        userId: existing.id,
        email: existing.email,
        isDemo: true,
      };
      const accessToken = await this.generateAccessToken(payload);
      const refreshToken = await this.createRefreshToken(existing.id);

      return {
        user: {
          id: existing.id,
          email: existing.email,
          firstName: existing.firstName,
          lastName: existing.lastName,
          isDemo: existing.isDemo,
          createdAt: existing.createdAt.toISOString(),
          updatedAt: existing.updatedAt.toISOString(),
        },
        accessToken,
        refreshToken,
      };
    }

    // Register demo user
    return await this.register({
      email: demoEmail,
      password: crypto.randomBytes(16).toString('hex'),
      firstName: 'Bryan',
      lastName: 'Thomas',
    });
  }
}
