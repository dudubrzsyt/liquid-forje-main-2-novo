import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { customerId, value, billingType } = req.body;

    const response = await axios.post(
      "https://api.asaas.com/v3/payments",
      {
        customer: customerId,
        billingType, // "PIX" | "CREDIT_CARD" | "BOLETO"
        value,
        dueDate: "2026-08-20"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ASAAS_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.status(200).json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
