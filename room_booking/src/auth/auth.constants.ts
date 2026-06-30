
export const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
export const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;


export const AUTH_ERRORS = {
  EMAIL_TAKEN: 'User with this email already exists',
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_NOT_FOUND: 'User not found',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  REFRESH_TOKEN_REVOKED: 'Refresh token has been revoked',
  REFRESH_TOKEN_EXPIRED: 'Refresh token has expired',
};