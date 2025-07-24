import type { NextApiRequest, NextApiResponse } from "next";

/**
 * CORS configuration for API endpoints
 */
export const corsConfig = {
  origin: [
    'http://www.mayhem.local:3000',
    'http://api.mayhem.local:3000',
    'http://localhost:3000',
    'https://www.mayhem.local',
    'https://api.mayhem.local'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true
};

/**
 * Apply CORS headers to the response
 */
export function applyCorsHeaders(req: NextApiRequest, res: NextApiResponse) {
  const origin = req.headers.origin;
  
  // Check if the origin is allowed
  if (origin && corsConfig.origin.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Fallback for development - allow localhost
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  }
  
  res.setHeader('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

/**
 * Handle CORS preflight requests
 */
export function handleCors(req: NextApiRequest, res: NextApiResponse): boolean {
  applyCorsHeaders(req, res);
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // Indicates that the request was handled
  }
  
  return false; // Indicates that the request should continue processing
}
