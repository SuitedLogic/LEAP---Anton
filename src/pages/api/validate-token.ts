import { NextApiRequest, NextApiResponse } from "next";
import { handleCors } from "@/utils/cors.util";
import { verifyToken, isTokenValid } from "@/utils/jwt.util";
import { securityHeaders } from "@/utils/security.util";

interface ValidationResponse {
  success: boolean;
  valid: boolean;
  error?: string;
  tokenInfo?: {
    userId: string;
    username: string;
    exp: number;
    jti: string;
    tokenVersion?: number;
  };
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ValidationResponse>
) {
  // Apply security headers
  securityHeaders(req, res, () => {});
  
  // Handle CORS
  if (handleCors(req, res)) {
    return; // Request was handled (OPTIONS request)
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, valid: false, error: "Method not allowed" });
  }

  const { token } = req.body;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({
      success: false,
      valid: false,
      error: "Token is required"
    });
  }

  // Quick validity check
  if (!isTokenValid(token)) {
    return res.status(401).json({
      success: true,
      valid: false,
      error: "Token is invalid or expired"
    });
  }

  // Full verification with payload
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({
      success: true,
      valid: false,
      error: "Token verification failed"
    });
  }

  return res.status(200).json({
    success: true,
    valid: true,
    tokenInfo: {
      userId: payload.userId,
      username: payload.username,
      exp: payload.exp || 0,
      jti: payload.jti,
      tokenVersion: payload.tokenVersion
    }
  });
}
