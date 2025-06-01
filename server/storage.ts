import { users, type User, type InsertUser, type Player, type ChatMessage } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // LiveMap specific methods (using in-memory storage for real-time data)
  getPlayers(): Promise<Player[]>;
  updatePlayers(players: Player[]): Promise<void>;
  getChatMessages(): Promise<ChatMessage[]>;
  addChatMessage(message: ChatMessage): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private players: Player[];
  private chatMessages: ChatMessage[];
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.players = [];
    this.chatMessages = [];
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getPlayers(): Promise<Player[]> {
    return [...this.players];
  }

  async updatePlayers(players: Player[]): Promise<void> {
    this.players = players;
  }

  async getChatMessages(): Promise<ChatMessage[]> {
    return [...this.chatMessages].slice(-15); // Return last 15 messages
  }

  async addChatMessage(message: ChatMessage): Promise<void> {
    this.chatMessages.push(message);
    // Keep only last 50 messages in memory
    if (this.chatMessages.length > 50) {
      this.chatMessages = this.chatMessages.slice(-50);
    }
  }
}

export const storage = new MemStorage();
