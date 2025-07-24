import jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';
import crypto from 'crypto';

// JWT secret key - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h'; // Token expires in 24 hours

// Additional secret for extra security layer - prevents token forgery
const HMAC_SECRET = process.env.HMAC_SECRET || 'additional-hmac-secret-for-token-integrity';

// Server signature to prevent tokens from other servers
const SERVER_SIGNATURE = process.env.SERVER_SIGNATURE || 'mayhem-server-2025';

interface TokenPayload {
  userId: string;
  username: string;
  jti: string; // JWT ID for uniqueness
  iat?: number;
  exp?: number;
  tokenVersion?: number; // For token invalidation
  serverSignature?: string; // Server signature to prevent cross-server token usage
}

// In-memory token blacklist (in production, use Redis or database)
const tokenBlacklist = new Set<string>();

// Token version storage (in production, store in database)
const userTokenVersions = new Map<string, number>();

/**
 * Generate a JWT token for a user with enhanced security
 */
export function generateToken(userId: string, username: string): string {
  // Generate unique JWT ID to prevent replay attacks
  const jti = crypto.randomBytes(16).toString('hex');
  
  // Get or increment token version for this user
  const currentVersion = userTokenVersions.get(userId) || 0;
  const tokenVersion = currentVersion + 1;
  userTokenVersions.set(userId, tokenVersion);

  const payload: TokenPayload = {
    userId,
    username,
    jti,
    tokenVersion,
    serverSignature: SERVER_SIGNATURE,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'mayhem-app',
    audience: 'mayhem-users',
    algorithm: 'HS256', // Explicitly specify algorithm to prevent algorithm confusion attacks
  });
}

/**
 * Verify and decode a JWT token with enhanced security checks
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    // First check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      console.warn('Token is blacklisted');
      return null;
    }

    // Verify token structure and prevent malformed tokens
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.warn('Invalid token structure');
      return null;
    }

    // Verify the token with strict options
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'mayhem-app',
      audience: 'mayhem-users',
      algorithms: ['HS256'], // Only allow HS256 algorithm
      clockTolerance: 30, // Allow 30 seconds clock skew
    }) as TokenPayload;

    // Additional validation checks
    if (!decoded.userId || !decoded.username || !decoded.jti) {
      console.warn('Token missing required fields');
      return null;
    }

    // Verify server signature to prevent cross-server token usage
    if (decoded.serverSignature !== SERVER_SIGNATURE) {
      console.warn('Invalid server signature - token may be from another server');
      return null;
    }

    // Check token version (for token invalidation)
    if (decoded.tokenVersion) {
      const currentVersion = userTokenVersions.get(decoded.userId) || 0;
      if (decoded.tokenVersion < currentVersion) {
        console.warn('Token version outdated');
        return null;
      }
    }

    // Verify token age (additional check beyond exp)
    if (decoded.iat) {
      const tokenAge = Date.now() / 1000 - decoded.iat;
      const maxAge = 24 * 60 * 60; // 24 hours in seconds
      if (tokenAge > maxAge) {
        console.warn('Token too old');
        return null;
      }
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('Token expired:', error.message);
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('Invalid token:', error.message);
    } else if (error instanceof jwt.NotBeforeError) {
      console.warn('Token not active yet:', error.message);
    } else {
      console.error('JWT verification failed:', error);
    }
    return null;
  }
}

/**
 * Extract token from cookies or Authorization header
 */
export function extractTokenFromRequest(req: NextApiRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try to get token from cookies
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
}

/**
 * Middleware to verify JWT token and attach user info to request
 */
export function authenticateToken(req: NextApiRequest): TokenPayload | null {
  const token = extractTokenFromRequest(req);
  
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Blacklist a token (for logout or security breach)
 */
export function blacklistToken(token: string): void {
  tokenBlacklist.add(token);
  
  // Clean up old blacklisted tokens periodically
  if (tokenBlacklist.size > 1000) {
    // In production, implement proper cleanup based on expiry
    const tokensArray = Array.from(tokenBlacklist);
    const keepCount = 500;
    for (let i = 0; i < tokensArray.length - keepCount; i++) {
      tokenBlacklist.delete(tokensArray[i]);
    }
  }
}

/**
 * Invalidate all tokens for a user (useful for security breaches)
 */
export function invalidateUserTokens(userId: string): void {
  const currentVersion = userTokenVersions.get(userId) || 0;
  userTokenVersions.set(userId, currentVersion + 10); // Increment by 10 to invalidate all current tokens
}

/**
 * Check if a token is valid without decoding (for quick checks)
 */
export function isTokenValid(token: string): boolean {
  if (!token || tokenBlacklist.has(token)) {
    return false;
  }
  
  try {
    jwt.verify(token, JWT_SECRET, {
      issuer: 'mayhem-app',
      audience: 'mayhem-users',
      algorithms: ['HS256'],
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a secure token hash for additional verification
 */
export function generateTokenHash(userId: string, jti: string, exp?: number): string {
  return crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(`${userId}:${jti}:${exp || ''}`)
    .digest('hex');
}
