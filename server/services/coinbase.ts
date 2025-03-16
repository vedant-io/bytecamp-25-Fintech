import coinbase from "coinbase-commerce-node";
import dotenv from "dotenv";

dotenv.config();

const { Client, resources, Webhook } = coinbase;

// Initialize the Coinbase client with the API key from environment variables.
// A fallback key ('mock_api_key') is provided for development/testing.
Client.init(process.env.COINBASE_API_KEY || "mock_api_key");

// Define an interface for the charge creation parameters.
export interface CreateChargeParams {
  amount: number;
  currency: string;
  userId: number;
  ngoId: number;
}

/**
 * Creates a donation charge using Coinbase Commerce.
 *
 * @param {CreateChargeParams} params - The donation parameters.
 * @returns {Promise<any>} The created charge object.
 */
export async function createCharge({
  amount,
  currency,
  userId,
  ngoId,
}: CreateChargeParams): Promise<any> {
  try {
    const charge = await resources.Charge.create({
      name: "NGO Donation",
      description: "Donation via blockchain technology",
      local_price: {
        amount: amount.toString(), // Ensure amount is a string
        currency: currency,
      },
      pricing_type: "fixed_price",
      metadata: {
        user_id: userId.toString(),
        ngo_id: ngoId.toString(),
      },
    });
    return charge;
  } catch (error) {
    console.error("Coinbase charge creation error:", error);
    throw error;
  }
}

/**
 * Verifies a webhook event from Coinbase Commerce.
 *
 * @param {string} rawBody - The raw body string of the webhook request.
 * @param {string} signature - The signature provided in the request headers.
 * @returns {any} The verified event object.
 */
export function verifyWebhook(rawBody: string, signature: string): any {
  try {
    return Webhook.verifyEventBody(
      rawBody,
      signature,
      process.env.COINBASE_WEBHOOK_SECRET || "mock_webhook_secret",
    );
  } catch (error) {
    console.error("Webhook verification error:", error);
    throw error;
  }
}