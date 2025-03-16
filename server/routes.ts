import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import {
  insertNgoSchema,
  insertDonationSchema,
  insertWithdrawalSchema,
} from "@shared/schema";
import { createCharge, verifyWebhook } from "./services/coinbase";
import * as express from "express";

// Add this interface to handle the rawBody property
declare global {
  namespace Express {
    interface Request {
      rawBody?: string;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Modify express.json middleware to capture raw body for webhooks
  app.use(
    express.json({
      verify: (req: Request, _res, buf) => {
        if (req.url?.startsWith("/api/webhooks")) {
          req.rawBody = buf.toString();
        }
      },
    }),
  );

  // NGO Routes
  app.get("/api/ngos", async (_req, res) => {
    const ngos = await storage.listNgos();
    res.json(ngos);
  });

  app.get("/api/ngos/:id", async (req, res) => {
    const ngo = await storage.getNgo(parseInt(req.params.id));
    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }
    res.json(ngo);
  });

  app.post("/api/ngos", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "ngo") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const result = insertNgoSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid NGO data" });
    }

    const ngo = await storage.createNgo({
      ...result.data,
      userId: req.user.id,
    });
    res.status(201).json(ngo);
  });

  // Donation Routes
  app.post("/api/donations", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "donor") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const result = insertDonationSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid donation data" });
    }

    const donation = await storage.createDonation({
      ...result.data,
      donorId: req.user.id,
    });
    res.status(201).json(donation);
  });

  app.get("/api/donations/ngo/:ngoId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const donations = await storage.getDonationsByNgo(
      parseInt(req.params.ngoId),
    );
    res.json(donations);
  });

  app.get("/api/donations/donor/:donorId", async (req, res) => {
    if (
      !req.isAuthenticated() ||
      req.user.id !== parseInt(req.params.donorId)
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const donations = await storage.getDonationsByDonor(
      parseInt(req.params.donorId),
    );
    res.json(donations);
  });

  // Coinbase checkout endpoint
  app.post("/api/donations/checkout", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "donor") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const { amount, currency, ngoId } = req.body;

      const charge = await createCharge({
        amount,
        currency,
        userId: req.user.id,
        ngoId,
      });

      res.status(200).json({ charge });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({
        message: "Failed to create payment checkout",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Coinbase webhook handler
  app.post("/api/webhooks/coinbase", async (req, res) => {
    try {
      const event = verifyWebhook(
        req.rawBody!,
        req.headers["x-cc-webhook-signature"] as string,
      );

      if (event.type === "charge:confirmed") {
        const { user_id, ngo_id } = event.data.metadata;
        const { amount, currency } = event.data.pricing.local;

        // Record the confirmed donation
        await storage.createDonation({
          donorId: parseInt(user_id),
          ngoId: parseInt(ngo_id),
          amount: parseFloat(amount),
          transactionHash: event.data.code,
          status: "completed",
        });
      }

      res.sendStatus(200);
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({
        message: "Failed to process webhook",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Withdrawal Routes
  app.post("/api/withdrawals", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "ngo") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const result = insertWithdrawalSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid withdrawal data" });
    }

    const ngo = await storage.getNgoByUserId(req.user.id);
    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    const withdrawal = await storage.createWithdrawal({
      ...result.data,
      ngoId: ngo.id,
    });
    res.status(201).json(withdrawal);
  });

  app.get("/api/withdrawals/ngo/:ngoId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const withdrawals = await storage.getWithdrawalsByNgo(
      parseInt(req.params.ngoId),
    );
    res.json(withdrawals);
  });

  const httpServer = createServer(app);
  return httpServer;
}

