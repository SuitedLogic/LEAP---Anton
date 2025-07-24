import { NextApiRequest, NextApiResponse } from 'next';

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiting middleware
 */
export function rateLimit(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const key = `rate_limit:${clientIp}`;
    const now = Date.now();
    
    const record = rateLimitStore.get(key);
    
    if (!record || now > record.resetTime) {
      // Reset the rate limit window
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (record.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    record.count++;
    next();
  };
}

/**
 * Security headers middleware
 */
export function securityHeaders(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
}

/**
 * Input validation middleware
 */
export function validateInput(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  // Check for common injection patterns
  const checkString = (str: string): boolean => {
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /eval\(/i,
      /expression\(/i,
      /url\(/i,
    ];
    
    return dangerousPatterns.some(pattern => pattern.test(str));
  };
  
  const validateObject = (obj: unknown): boolean => {
    if (typeof obj === 'string') {
      return checkString(obj);
    }
    
    if (typeof obj === 'object' && obj !== null) {
      for (const value of Object.values(obj)) {
        if (validateObject(value)) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  if (req.body && validateObject(req.body)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input detected'
    });
  }
  
  next();
}

/**
 * Token freshness check (prevent token replay attacks)
 */
export function checkTokenFreshness(maxAge: number = 5 * 60 * 1000) { // 5 minutes
  return (tokenPayload: { iat?: number }): boolean => {
    if (!tokenPayload.iat) {
      return false;
    }
    
    const tokenAge = Date.now() - (tokenPayload.iat * 1000);
    return tokenAge <= maxAge;
  };
}

/**
 * IP validation middleware
 */
export function validateClientIP(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  // Basic IP validation
  if (!clientIp) {
    return res.status(400).json({
      success: false,
      error: 'Client IP required'
    });
  }
  
  // Add IP to request for logging
  (req as NextApiRequest & { clientIp: string }).clientIp = clientIp as string;
  
  next();
}
