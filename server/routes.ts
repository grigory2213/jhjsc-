import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import multer from "multer";
import path from "path";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "audio/mpeg") {
      cb(new Error("Only MP3 files are allowed"));
      return;
    }
    cb(null, true);
  },
});

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Task routes
  app.get("/api/tasks", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    // If admin, get all tasks; if regular user, get only assigned tasks
    const tasks = req.user.isAdmin 
      ? await storage.getTasks()
      : await storage.getTasksAssignedTo(req.user.id);
    res.json(tasks);
  });

  app.get("/api/tasks/:id", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const task = await storage.getTask(parseInt(req.params.id));
    if (!task) return res.sendStatus(404);
    // Allow access if user is admin or the task is assigned to them
    if (!req.user.isAdmin && task.assignedToId !== req.user.id) {
      return res.sendStatus(403);
    }
    res.json(task);
  });

  app.post("/api/tasks", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    if (!req.user.isAdmin) return res.sendStatus(403);
    const task = await storage.createTask(req.user.id, req.body);
    res.status(201).json(task);
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const task = await storage.getTask(parseInt(req.params.id));
    if (!task) return res.sendStatus(404);
    if (!req.user.isAdmin && task.assignedToId !== req.user.id) {
      return res.sendStatus(403);
    }

    // Only admins can reassign tasks
    if (req.body.assignedToId && !req.user.isAdmin) {
      return res.sendStatus(403);
    }

    const updated = await storage.updateTask(task.id, req.body);
    res.json(updated);
  });

  app.post("/api/tasks/:id/audio", upload.single("audio"), async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    if (!req.file) return res.status(400).send("No audio file uploaded");

    const task = await storage.getTask(parseInt(req.params.id));
    if (!task) return res.sendStatus(404);
    if (!req.user.isAdmin && task.assignedToId !== req.user.id) {
      return res.sendStatus(403);
    }

    // In a real app, we'd upload to S3/etc and store the URL
    // For demo, we'll store the data URL
    const audioData = req.file.buffer.toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${audioData}`;

    const updated = await storage.updateTask(task.id, { audioUrl });
    res.json(updated);
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    if (!req.user.isAdmin) return res.sendStatus(403);
    const task = await storage.getTask(parseInt(req.params.id));
    if (!task) return res.sendStatus(404);

    await storage.deleteTask(task.id);
    res.sendStatus(204);
  });

  // Add endpoint to get all users (for admin task assignment)
  app.get("/api/users", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    if (!req.user.isAdmin) return res.sendStatus(403);
    const users = await storage.getUsers();
    res.json(users);
  });

  const httpServer = createServer(app);
  return httpServer;
}