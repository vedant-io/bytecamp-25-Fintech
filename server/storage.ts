import { IStorage } from "./storage";
import {
  type User,
  type Ngo,
  type Donation,
  type Withdrawal,
  type InsertUser,
  type InsertNgo,
  type InsertDonation,
  type InsertWithdrawal,
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // NGO operations
  getNgo(id: number): Promise<Ngo | undefined>;
  getNgoByUserId(userId: number): Promise<Ngo | undefined>;
  listNgos(): Promise<Ngo[]>;
  createNgo(ngo: InsertNgo): Promise<Ngo>;

  // Donation operations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonationsByNgo(ngoId: number): Promise<Donation[]>;
  getDonationsByDonor(donorId: number): Promise<Donation[]>;

  // Withdrawal operations
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  getWithdrawalsByNgo(ngoId: number): Promise<Withdrawal[]>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ngos: Map<number, Ngo>;
  private donations: Map<number, Donation>;
  private withdrawals: Map<number, Withdrawal>;
  sessionStore: session.Store;
  private currentId: number;

  private createInitialNgos() {
    const initialNgos = [
      {
        userId: 1,
        name: "Education For All",
        description: "Working to provide quality education to underprivileged children across rural areas. Our programs focus on building schools, training teachers, and providing educational materials.",
        registrationNumber: "EDU123456",
        sector: "Education",
        location: "New Delhi, India",
        contactEmail: "contact@educationforall.org",
        contactPhone: "+91-9876543210",
        impactScore: 4.5,
      },
      {
        userId: 2,
        name: "Green Earth Initiative",
        description: "Dedicated to environmental conservation through tree planting, waste management, and community awareness programs. We work with local communities to create sustainable environmental solutions.",
        registrationNumber: "ENV789012",
        sector: "Environment",
        location: "Mumbai, India",
        contactEmail: "info@greenearth.org",
        contactPhone: "+91-9876543211",
        impactScore: 4.2,
      },
      {
        userId: 3,
        name: "Health First Foundation",
        description: "Providing healthcare services to remote villages and urban slums. We organize medical camps, vaccination drives, and health awareness programs.",
        registrationNumber: "HEA345678",
        sector: "Health",
        location: "Bangalore, India",
        contactEmail: "help@healthfirst.org",
        contactPhone: "+91-9876543212",
        impactScore: 4.8,
      }
    ];

    initialNgos.forEach(ngo => {
      const id = this.currentId++;
      this.ngos.set(id, { ...ngo, id });
    });
  }

  constructor() {
    this.users = new Map();
    this.ngos = new Map();
    this.donations = new Map();
    this.withdrawals = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Create initial NGO data
    this.createInitialNgos();
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
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getNgo(id: number): Promise<Ngo | undefined> {
    return this.ngos.get(id);
  }

  async getNgoByUserId(userId: number): Promise<Ngo | undefined> {
    return Array.from(this.ngos.values()).find((ngo) => ngo.userId === userId);
  }

  async listNgos(): Promise<Ngo[]> {
    return Array.from(this.ngos.values());
  }

  async createNgo(insertNgo: InsertNgo): Promise<Ngo> {
    const id = this.currentId++;
    const ngo = { ...insertNgo, id, impactScore: 0 };
    this.ngos.set(id, ngo);
    return ngo;
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    const id = this.currentId++;
    const donation = {
      ...insertDonation,
      id,
      createdAt: new Date(),
    };
    this.donations.set(id, donation);
    return donation;
  }

  async getDonationsByNgo(ngoId: number): Promise<Donation[]> {
    return Array.from(this.donations.values()).filter(
      (donation) => donation.ngoId === ngoId,
    );
  }

  async getDonationsByDonor(donorId: number): Promise<Donation[]> {
    return Array.from(this.donations.values()).filter(
      (donation) => donation.donorId === donorId,
    );
  }

  async createWithdrawal(insertWithdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const id = this.currentId++;
    const withdrawal = {
      ...insertWithdrawal,
      id,
      createdAt: new Date(),
    };
    this.withdrawals.set(id, withdrawal);
    return withdrawal;
  }

  async getWithdrawalsByNgo(ngoId: number): Promise<Withdrawal[]> {
    return Array.from(this.withdrawals.values()).filter(
      (withdrawal) => withdrawal.ngoId === ngoId,
    );
  }
}

export const storage = new MemStorage();