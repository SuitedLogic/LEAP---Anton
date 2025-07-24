import type { NextApiRequest, NextApiResponse } from "next";
import { successResponse, errorResponse } from "@/utils/apiResponse.util";
import { handleCors } from "@/utils/cors.util";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  if (handleCors(req, res)) {
    return; // Request was handled (OPTIONS request)
  }

  if (req.method !== "POST") {
    return res.status(405).json(errorResponse("Method not allowed"));
  }

  const { fullName, email, message } = req.body;

  // Validate fullName
  if (!fullName || typeof fullName !== 'string') {
    return res
      .status(400)
      .json(errorResponse("Full name is required"));
  }

  const trimmedName = fullName.trim();
  if (trimmedName.length < 2) {
    return res
      .status(400)
      .json(errorResponse("Full name must be at least 2 characters long"));
  }

  if (trimmedName.length > 100) {
    return res
      .status(400)
      .json(errorResponse("Full name must be less than 100 characters"));
  }

  // Validate email
  if (!email || typeof email !== 'string') {
    return res
      .status(400)
      .json(errorResponse("Email address is required"));
  }

  const trimmedEmail = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmedEmail)) {
    return res
      .status(400)
      .json(errorResponse("Please enter a valid email address"));
  }

  // Validate message
  if (!message || typeof message !== 'string') {
    return res
      .status(400)
      .json(errorResponse("Message is required"));
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length < 10) {
    return res
      .status(400)
      .json(errorResponse("Message must be at least 10 characters long"));
  }

  if (trimmedMessage.length > 1000) {
    return res
      .status(400)
      .json(errorResponse("Message must be less than 1000 characters"));
  }

  return res.status(200).json(successResponse("Success form submitted"));
}
