import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.scores.list.path, async (_req, res) => {
    const topScores = await storage.getTopScores();
    res.json(topScores);
  });

  app.post(api.scores.create.path, async (req, res) => {
    try {
      const input = api.scores.create.input.parse(req.body);
      const score = await storage.createScore(input);
      res.status(201).json(score);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}

async function seedDatabase() {
  const existingScores = await storage.getTopScores();
  if (existingScores.length === 0) {
    await storage.createScore({ playerName: "Santa", score: 1000 });
    await storage.createScore({ playerName: "Elf", score: 500 });
    await storage.createScore({ playerName: "Rudolph", score: 1500 });
  }
}

// Run seed on startup (optional, or call from index.ts)
seedDatabase().catch(console.error);
