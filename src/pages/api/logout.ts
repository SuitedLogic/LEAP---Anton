import { NextApiRequest, NextApiResponse } from "next";
import { handleCors } from "@/utils/cors.util";
import { extractTokenFromRequest, blacklistToken } from "@/utils/jwt.util";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  if (handleCors(req, res)) {
    return; // Request was handled (OPTIONS request)
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  // Extract and blacklist the current token
  const token = extractTokenFromRequest(req);
  if (token) {
    blacklistToken(token);
  }

  // Clear the cookie
  res.setHeader("Set-Cookie", "token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0");

  return res.status(200).json({ 
    success: true, 
    message: "Successfully logged out and token invalidated" 
  });
}
