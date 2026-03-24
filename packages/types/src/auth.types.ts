export type JwtPayload = {
  sub: string
  email: string
  iat: number
  exp: number
}

export type TokenPair = {
  accessToken: string
  refreshToken: string
}

export type RegisterRequest = {
  email: string
  password: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type AuthResponse = {
  user: { id: string; email: string }
  tokens: TokenPair
}
