import { db } from "./db";
import { dishes, categories, type InsertDish, type InsertCategory } from "@shared/schema";

const sampleCategories: InsertCategory[] = [
  {
    name: "Platos Principales",
    doorImageUrl: "https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    sortOrder: 0
  },
  {
    name: "Cuencos y Bowls", 
    doorImageUrl: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    sortOrder: 1
  }
];

export async function seedDatabase() {
  try {
    // Check if database is already seeded
    const existingDishes = await db.select().from(dishes).limit(1);
    
    if (existingDishes.length === 0) {
      console.log("Seeding database with sample categories and dishes...");
      
      // Insert categories first
      const insertedCategories = await db.insert(categories).values(sampleCategories).returning();
      const categoryIds = insertedCategories.map(cat => cat.id);
      
      // Create sample dishes grouped by categories (8 per category)
      const sampleDishes: InsertDish[] = [
        // First category - Platos Principales
        { name: "Plato de Cerámica Moderna", price: "2800", imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", categoryId: categoryIds[0], sortOrder: 0 },
        { name: "Plato para Postre Elegante", price: "1980", imageUrl: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", categoryId: categoryIds[0], sortOrder: 1 },
        { name: "Plato de Madera Rústico", price: "4500", imageUrl: "https://images.unsplash.com/photo-1610986602538-431d65df4385?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", categoryId: categoryIds[0], sortOrder: 2 },
        { name: "Plato Artístico de Colores", price: "3800", imageUrl: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", categoryId: categoryIds[0], sortOrder: 3 },
        { name: "Plato Negro Minimalista", price: "2400", imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", categoryId: categoryIds[0], sortOrder: 4 },
        { name: "Plato de Porcelana Blanca", price: "3200", imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", categoryId: categoryIds[0], sortOrder: 5 },
        { name: "Plato de Vidrio Templado", price: "2600", imageUrl: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", categoryId: categoryIds[0], sortOrder: 6 },
        { name: "Plato de Cobre Martillado", price: "5200", imageUrl: "https://images.unsplash.com/photo-1610986602538-431d65df4385?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", categoryId: categoryIds[0], sortOrder: 7 },
        
        // Second category - Cuencos y Bowls
        { name: "Cuenco de Cerámica Japonesa", price: "3200", imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", categoryId: categoryIds[1], sortOrder: 0 },
        { name: "Cuenco de Bambú", price: "2100", imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", categoryId: categoryIds[1], sortOrder: 1 },
        { name: "Bowl de Porcelana Azul", price: "2900", imageUrl: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", categoryId: categoryIds[1], sortOrder: 2 },
        { name: "Cuenco de Vidrio Esmerilado", price: "2300", imageUrl: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", categoryId: categoryIds[1], sortOrder: 3 },
        { name: "Bowl de Madera Natural", price: "3800", imageUrl: "https://images.unsplash.com/photo-1610986602538-431d65df4385?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", categoryId: categoryIds[1], sortOrder: 4 },
        { name: "Cuenco de Acero Inoxidable", price: "1800", imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", categoryId: categoryIds[1], sortOrder: 5 },
        { name: "Bowl de Cerámica Texturizada", price: "3500", imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", categoryId: categoryIds[1], sortOrder: 6 },
        { name: "Cuenco de Cristal Tallado", price: "4200", imageUrl: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400", categoryId: categoryIds[1], sortOrder: 7 }
      ];
      
      await db.insert(dishes).values(sampleDishes);
      
      console.log("Database seeded successfully with categories and dishes!");
    } else {
      console.log("Database already contains data, skipping seed.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}