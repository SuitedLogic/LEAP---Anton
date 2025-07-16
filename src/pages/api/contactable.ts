import type { NextApiRequest, NextApiResponse } from "next";
import { successResponse, errorResponse } from "@/utils/apiResponse.util";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json(errorResponse("Method not allowed"));
  }

  const { fullName, email, message } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res
      .status(400)
      .json(errorResponse("Please provide a valid email address"));
  }

  if (!fullName || fullName.trim().length < 2 || fullName.trim().length > 100) {
    return res
      .status(400)
      .json(errorResponse("Name must be between 2 and 100 characters"));
  }

  if (!message || message.trim().length < 10 || message.trim().length > 1000) {
    return res
      .status(400)
      .json(errorResponse("Message must be between 10 and 1000 characters"));
  }

  return res.status(200).json(successResponse("Success form submitted"));
}
