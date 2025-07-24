import { userData } from "@/data/user.data";
import { errorResponse, successResponse } from "@/utils/apiResponse.util";
import { NextApiRequest, NextApiResponse } from "next";
import { handleCors } from "@/utils/cors.util";
import { authenticateToken } from "@/utils/jwt.util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS
  if (handleCors(req, res)) {
    return; // Request was handled (OPTIONS request)
  }

  console.log('Users API called:', {
    method: req.method,
    headers: {
      authorization: req.headers.authorization,
      cookie: req.headers.cookie
    }
  });

  if (req.method === "GET") {
    // Verify JWT token
    const userInfo = authenticateToken(req);
    
    console.log('Token validation result:', userInfo);
    
    if (!userInfo) {
      console.log('Authentication failed - no valid token');
      return res.status(401).json(errorResponse("Unauthorized - Invalid or missing token"));
    }

    // Return all users but filter out sensitive data
    const safeUserData = userData.map(user => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { secret, ...safeUser } = user;
      return safeUser;
    });
    
    res.status(200).json(successResponse(safeUserData));
  } else {
    res.status(404).json(errorResponse("Route not found"));
  }
}
