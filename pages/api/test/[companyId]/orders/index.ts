import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { companyId } = req.query;
  res.status(200).json({ message: 'Hello, WORLD from orders!', companyId });
}

