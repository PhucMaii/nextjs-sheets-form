import { NextApiRequest, NextApiResponse } from "next";
import POST from "./POST";
import withAdminAuthGuard from "../../utils/withAdminAuthGuard";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === "POST") {
      const response = await POST(req, res);
      return response;
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default withAdminAuthGuard(handler);
