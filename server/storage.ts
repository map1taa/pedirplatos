import { type Dish, type InsertDish, type Order, type InsertOrder, type OrderItem, type InsertOrderItem, type OrderWithItems } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Dish operations
  getDishes(): Promise<Dish[]>;
  getDish(id: string): Promise<Dish | undefined>;
  createDish(dish: InsertDish): Promise<Dish>;
  updateDish(id: string, dish: Partial<InsertDish>): Promise<Dish | undefined>;
  deleteDish(id: string): Promise<boolean>;

  // Order operations
  getOrders(): Promise<OrderWithItems[]>;
  getOrder(id: string): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined>;

  // Order item operations
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: string): Promise<(OrderItem & { dish: Dish })[]>;
}

export class MemStorage implements IStorage {
  private dishes: Map<string, Dish>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;

  constructor() {
    this.dishes = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    // Initialize with sample dishes
    this.initializeSampleData();
  }

  private async initializeSampleData() {
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

    for (const dish of sampleDishes) {
      await this.createDish(dish);
    }
  }

  async getDishes(): Promise<Dish[]> {
    return Array.from(this.dishes.values());
  }

  async getDish(id: string): Promise<Dish | undefined> {
    return this.dishes.get(id);
  }

  async createDish(insertDish: InsertDish): Promise<Dish> {
    const id = randomUUID();
    const dish: Dish = { ...insertDish, id };
    this.dishes.set(id, dish);
    return dish;
  }

  async updateDish(id: string, updates: Partial<InsertDish>): Promise<Dish | undefined> {
    const dish = this.dishes.get(id);
    if (!dish) return undefined;

    const updatedDish = { ...dish, ...updates };
    this.dishes.set(id, updatedDish);
    return updatedDish;
  }

  async deleteDish(id: string): Promise<boolean> {
    return this.dishes.delete(id);
  }

  async getOrders(): Promise<OrderWithItems[]> {
    const orders = Array.from(this.orders.values());
    const ordersWithItems: OrderWithItems[] = [];

    for (const order of orders) {
      const items = await this.getOrderItems(order.id);
      ordersWithItems.push({ ...order, items });
    }

    return ordersWithItems;
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const items = await this.getOrderItems(order.id);
    return { ...order, items };
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const order: Order = { ...insertOrder, id, createdAt };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder = { ...order, ...updates };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  async getOrderItems(orderId: string): Promise<(OrderItem & { dish: Dish })[]> {
    const items = Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
    const itemsWithDishes: (OrderItem & { dish: Dish })[] = [];

    for (const item of items) {
      const dish = await this.getDish(item.dishId);
      if (dish) {
        itemsWithDishes.push({ ...item, dish });
      }
    }

    return itemsWithDishes;
  }
}

export const storage = new MemStorage();
