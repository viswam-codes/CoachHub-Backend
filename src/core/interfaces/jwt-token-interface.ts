export const TOKEN_SERVICE = Symbol('TOKEN-SERVICE');

export interface ITokenService {
  generateTokens(payload: { id: string; email: string; }): Promise<{ accessToken: string; refreshToken: string; }>
    verifyToken(token: string): any;
  }
  