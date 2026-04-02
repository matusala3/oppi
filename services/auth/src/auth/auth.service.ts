import { Injectable, ConflictException, UnauthorizedException, Inject } from '@nestjs/common'
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
export class AuthService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, dto.email))

    if (existing.length > 0) {
      throw new ConflictException('Email already registered')
    }

    const passwordHash = await bcrypt.hash(dto.password, 12)

    const [user] = await this.db
      .insert(schema.users)
      .values({ email: dto.email, passwordHash })
      .returning()

    const tokens = await this.issueTokens(user.id, user.email)

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

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash)
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const tokens = await this.issueTokens(user.id, user.email)
    return { user: { id: user.id, email: user.email }, tokens }
  }

  async refresh(userId: string, rawRefreshToken: string): Promise<TokenPair> {
    const tokenHash = this.hashToken(rawRefreshToken)

    const [stored] = await this.db
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

    await this.db
      .delete(schema.refreshTokens)
      .where(eq(schema.refreshTokens.id, stored.id))

    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))

    return this.issueTokens(user.id, user.email)
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

  private async issueTokens(userId: string, email: string): Promise<TokenPair> {
    const payload: Pick<JwtPayload, 'sub' | 'email'> = { sub: userId, email }

    const accessToken = this.jwtService.sign(payload, {
      secret: env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    })

    const refreshToken = this.jwtService.sign(payload, {
      secret: env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    })

    await this.db.insert(schema.refreshTokens).values({
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
