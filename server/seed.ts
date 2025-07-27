import { db } from "./db";
import { dishes, type InsertDish } from "@shared/schema";

const sampleDishes: InsertDish[] = [
  {
    name: "モダン セラミック プレート",
    price: "2800",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
  },
  {
    name: "和風 陶器ボウル",
    price: "3200",
    imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
  },
  {
    name: "エレガント デザート皿",
    price: "1980",
    imageUrl: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
  },
  {
    name: "ラスティック ウッドプレート",
    price: "4500",
    imageUrl: "https://images.unsplash.com/photo-1610986602538-431d65df4385?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
  },
  {
    name: "アーティスティック カラープレート",
    price: "3800",
    imageUrl: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
  },
  {
    name: "ミニマル ブラックプレート",
    price: "2400",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
  }
];

export async function seedDatabase() {
  try {
    // Check if database is already seeded
    const existingDishes = await db.select().from(dishes).limit(1);
    
    if (existingDishes.length === 0) {
      console.log("Seeding database with sample dishes...");
      
      for (const dish of sampleDishes) {
        await db.insert(dishes).values(dish);
      }
      
      console.log("Database seeded successfully!");
    } else {
      console.log("Database already contains data, skipping seed.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}