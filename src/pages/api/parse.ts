// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { simpleParser } from "mailparser";
import type { ParsedMail } from "mailparser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ParsedMail | string>,
) {
  // Get file link
  const { url } = req.query;

  if (typeof url !== "string") {
    res.status(400).json("Invalid url param");
    return;
  }

  try {
    const sourceBuffer = await fetch(url).then((res) => res.arrayBuffer());

    // Create email read stream
    const parsed = await simpleParser(Buffer.from(sourceBuffer));

    res.setHeader("Cache-Control", "private, max-age=86400, immutable");
    res.status(200).json(parsed);
  } catch (e: any) {
    res.status(500).json(e.message);
  }
}
