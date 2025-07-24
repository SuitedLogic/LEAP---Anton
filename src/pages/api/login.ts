import { PASSWORD, USERNAME } from "@/constants/user.constants";
import { NextApiRequest, NextApiResponse } from "next";
import { handleCors } from "@/utils/cors.util";
import { generateToken } from "@/utils/jwt.util";
import { securityHeaders, validateInput, validateClientIP } from "@/utils/security.util";

// Rate limiting for login attempts (in production, use Redis)
const loginAttempts = new Map<string, { count: number; blockedUntil?: number }>();

type LoginResponse = {
  success: boolean;
  data?: {
    token: string;
    user: {
      id: string;
      username: string;
    };
  };
  error?: string;
  blockedUntil?: number;
};

function checkRateLimit(clientIp: string): { allowed: boolean; blockedUntil?: number } {
  const attempts = loginAttempts.get(clientIp);
  const now = Date.now();
  
  if (!attempts) {
    loginAttempts.set(clientIp, { count: 1 });
    return { allowed: true };
  }
  
  if (attempts.blockedUntil && now < attempts.blockedUntil) {
    return { allowed: false, blockedUntil: attempts.blockedUntil };
  }
  
  if (attempts.count >= 5) {
    // Block for 15 minutes after 5 failed attempts
    const blockedUntil = now + (15 * 60 * 1000);
    attempts.blockedUntil = blockedUntil;
    return { allowed: false, blockedUntil };
  }
  
  return { allowed: true };
}

function recordFailedAttempt(clientIp: string): void {
  const attempts = loginAttempts.get(clientIp) || { count: 0 };
  attempts.count++;
  loginAttempts.set(clientIp, attempts);
}

function clearAttempts(clientIp: string): void {
  loginAttempts.delete(clientIp);
}
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  // Apply security headers
  securityHeaders(req, res, () => {});
  
  // Handle CORS
  if (handleCors(req, res)) {
    return; // Request was handled (OPTIONS request)
  }

  console.log('Login API called:', {
    method: req.method,
    body: req.body,
    headers: req.headers['content-type']
  });

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  // Validate client IP
  validateClientIP(req, res, () => {});
  const clientIp = ((req as NextApiRequest & { clientIp?: string }).clientIp || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown') as string;

  // Check rate limiting
  const rateLimitCheck = checkRateLimit(clientIp);
  if (!rateLimitCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: "Too many failed login attempts. Please try again later.",
      blockedUntil: rateLimitCheck.blockedUntil
    });
  }

  // Validate input
  validateInput(req, res, () => {});

  const { username, password } = req.body;

  // Basic input validation
  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    recordFailedAttempt(clientIp);
    return res.status(400).json({
      success: false,
      error: "Username and password are required",
    });
  }

  // Trim and validate length
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (trimmedUsername.length === 0 || trimmedPassword.length === 0) {
    recordFailedAttempt(clientIp);
    return res.status(400).json({
      success: false,
      error: "Username and password cannot be empty",
    });
  }

  if (trimmedUsername !== USERNAME || trimmedPassword !== PASSWORD) {
    recordFailedAttempt(clientIp);
    return res.status(401).json({
      success: false,
      error: "Invalid credentials",
    });
  }

  // Clear failed attempts on successful login
  clearAttempts(clientIp);

  // Generate a proper JWT token
  const userId = "user-1"; // In a real app, this would come from the database
  const token = generateToken(userId, username);

  // Set secure HTTP-only cookie
  res.setHeader("Set-Cookie", `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);

  return res.status(200).json({
    success: true,
    data: {
      token: token,
      user: {
        id: userId,
        username: username,
      },
    },
  });
}
