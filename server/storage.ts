import { User, InsertUser, Task, InsertTask } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;

  getTasks(userId?: number): Promise<Task[]>;
  getTasksAssignedTo(userId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(userId: number, task: Omit<InsertTask, "userId">): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  sessionStore: session.Store;
  private currentUserId: number;
  private currentTaskId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.currentUserId = 1;
    this.currentTaskId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      // Make the first user an admin
      isAdmin: insertUser.isAdmin || this.users.size === 0 
    };
    this.users.set(id, user);
    return user;
  }

  async getTasks(userId?: number): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values());
    return userId ? tasks.filter(task => task.userId === userId) : tasks;
  }

  async getTasksAssignedTo(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.assignedToId === userId,
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(
    userId: number,
    task: Omit<InsertTask, "userId">,
  ): Promise<Task> {
    const id = this.currentTaskId++;
    const newTask: Task = {
      ...task,
      id,
      userId,
      assignedToId: task.assignedToId,
      latitude: task.latitude || null,
      longitude: task.longitude || null,
      audioUrl: task.audioUrl || null,
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task> {
    const existing = await this.getTask(id);
    if (!existing) throw new Error("Task not found");

    const updated: Task = {
      ...existing,
      ...task,
      latitude: task.latitude || existing.latitude || null,
      longitude: task.longitude || existing.longitude || null,
      audioUrl: task.audioUrl || existing.audioUrl || null,
      assignedToId: task.assignedToId || existing.assignedToId,
    };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: number): Promise<void> {
    this.tasks.delete(id);
  }
}

export const storage = new MemStorage();