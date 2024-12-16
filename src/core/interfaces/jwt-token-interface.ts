export const TOKEN_SERVICE = Symbol('TOKEN-SERVICE');

export interface ITokenService {
  generateToken(payload: { id: string; email: string }): Promise<string>
    verifyToken(token: string): any;
  }
  