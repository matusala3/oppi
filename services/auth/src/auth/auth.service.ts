import { Injectable, ConflictException, UnauthorizedException, Inject, OnModuleInit } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { eq, and } from 'drizzle-orm'
import { createHash } from 'crypto'
import * as bcrypt from 'bcrypt'
import { JwtPayload, TokenPair, AuthResponse } from '@oppi/types'
import { env } from '../config/env'
import { DATABASE, Database } from '../database/database.module'
import * as schema from '../database/schema'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService implements OnModuleInit {
  private dummyHash!: string

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit(): Promise<void> {
    // Pre-computed at startup — used in login to prevent timing attacks
    // Both "user not found" and "wrong password" paths take ~250ms
    this.dummyHash = await bcrypt.hash('dummy-password-for-timing-protection', 12)
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, dto.email))

    if (existing.length > 0) {
      throw new ConflictException('Email already registered')
    }

    const passwordHash = await bcrypt.hash(dto.password, 12)

    // Transaction ensures both user + refresh token are inserted atomically
    // If refresh token insert fails, user insert is rolled back — no ghost users
    const { user, tokens } = await this.db.transaction(async (tx) => {
      const [newUser] = await tx
        .insert(schema.users)
        .values({ email: dto.email, passwordHash })
        .returning()

      const issuedTokens = await this.issueTokens(newUser.id, newUser.email, tx)

      return { user: newUser, tokens: issuedTokens }
    })

    // TODO: publish UserRegisteredEvent to SNS
    // topic: oppi-user-events
    // event shape: packages/types/src/events.types.ts → UserRegisteredEvent
    // implement when @aws-sdk/client-sns is added (Phase 3)

    return { user: { id: user.id, email: user.email }, tokens }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, dto.email))

    // Always run bcrypt even when user not found — prevents timing attacks
    // Without this, attacker can detect registered emails by measuring response time
    const hashToCompare = user ? user.passwordHash : this.dummyHash
    const passwordMatch = await bcrypt.compare(dto.password, hashToCompare)

    if (!user || !passwordMatch) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const tokens = await this.issueTokens(user.id, user.email)
    return { user: { id: user.id, email: user.email }, tokens }
  }

  async refresh(userId: string, rawRefreshToken: string): Promise<TokenPair> {
    const tokenHash = this.hashToken(rawRefreshToken)

    // Transaction ensures old token is deleted and new token is inserted atomically
    // If new token insert fails, old token deletion is rolled back — user not locked out
    return await this.db.transaction(async (tx) => {
      const [stored] = await tx
        .select()
        .from(schema.refreshTokens)
        .where(
          and(
            eq(schema.refreshTokens.userId, userId),
            eq(schema.refreshTokens.tokenHash, tokenHash),
          ),
        )

      if (!stored || stored.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token')
      }

      await tx
        .delete(schema.refreshTokens)
        .where(eq(schema.refreshTokens.id, stored.id))

      const [user] = await tx
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId))

      return this.issueTokens(user.id, user.email, tx)
    })
  }

  async logout(userId: string, rawRefreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawRefreshToken)

    await this.db
      .delete(schema.refreshTokens)
      .where(
        and(
          eq(schema.refreshTokens.userId, userId),
          eq(schema.refreshTokens.tokenHash, tokenHash),
        ),
      )
  }

  private async issueTokens(
    userId: string,
    email: string,
    tx?: Database,
  ): Promise<TokenPair> {
    const payload: Pick<JwtPayload, 'sub' | 'email'> = { sub: userId, email }

    const accessToken = this.jwtService.sign(payload, {
      secret: env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    })

    const refreshToken = this.jwtService.sign(payload, {
      secret: env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    })

    const db = tx ?? this.db
    await db.insert(schema.refreshTokens).values({
      userId,
      tokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    return { accessToken, refreshToken }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }
}
