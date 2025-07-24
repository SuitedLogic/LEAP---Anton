import { cmsData } from "@/data/cms.data";
import { errorResponse, successResponse } from "@/utils/apiResponse.util";
import { NextApiRequest, NextApiResponse } from "next";
import { handleCors } from "@/utils/cors.util";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS
  if (handleCors(req, res)) {
    return; // Request was handled (OPTIONS request)
  }

  if (req.method === "GET") {
    res.status(200).json(successResponse(cmsData));
  } else {
    res.status(404).json(errorResponse("Route not found"));
  }
}
