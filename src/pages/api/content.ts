import { cmsData } from "@/data/cms.data";
import { errorResponse, successResponse } from "@/utils/apiResponse.util";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    res.status(200).json(successResponse(cmsData));
  } else {
    res.status(404).json(errorResponse("Route not found"));
  }
}
