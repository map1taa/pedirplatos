import { db } from "./db";
import { dishes, type InsertDish } from "@shared/schema";

const sampleDishes: InsertDish[] = [
  {
    name: "モダン セラミック プレート",
    description: "エレガントなブルーリムパターンの現代的なセラミックディナープレート",
    price: "2800",
    size: "Mサイズ (直径22cm)",
    category: "洋食器",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
  },
  {
    name: "和風 陶器ボウル",
    description: "自然な土の色調を持つ伝統的な日本の陶器ボウル",
    price: "3200",
    size: "Lサイズ (直径26cm)",
    category: "和食器",
    imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
  },
  {
    name: "エレガント デザート皿",
    description: "ゴールドアクセント付きの上品な白い磁器デザート皿",
    price: "1980",
    size: "Sサイズ (直径18cm)",
    category: "デザート皿",
    imageUrl: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
  },
  {
    name: "ラスティック ウッドプレート",
    description: "自然な木目パターンを持つ素朴な木製サービングプレート",
    price: "4500",
    size: "Lサイズ (直径26cm)",
    category: "洋食器",
    imageUrl: "https://images.unsplash.com/photo-1610986602538-431d65df4385?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
  },
  {
    name: "アーティスティック カラープレート",
    description: "芸術的なパターンを持つカラフルなセラミックプレート",
    price: "3800",
    size: "Mサイズ (直径22cm)",
    category: "洋食器",
    imageUrl: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
  },
  {
    name: "ミニマル ブラックプレート",
    description: "白い背景にミニマリストな黒いマットディナープレート",
    price: "2400",
    size: "Mサイズ (直径22cm)",
    category: "洋食器",
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