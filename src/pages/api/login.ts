import { PASSWORD, USERNAME } from "@/constants/user.constants";
import { NextApiRequest, NextApiResponse } from "next";

type LoginResponse = {
  success: boolean;
  data?: {
    token: string | null;
  };
  error?: string;
};
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  const { username, password } = req.body;

  if (username !== USERNAME || password !== PASSWORD) {
    return res.status(401).json({
      success: false,
      error: "Invalid credentials",
    });
  }

  const token = "TOKEN_HERE";

  res.setHeader("Set-Cookie", `token=${token}; Path=/; HttpOnly`);

  return res.status(200).json({
    success: true,
    data: {
      token: token,
    },
  });
}
