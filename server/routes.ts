import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDishSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "server", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded images
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(uploadDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  // Get all dishes
  app.get("/api/dishes", async (req: Request, res: Response) => {
    try {
      const dishes = await storage.getDishes();
      res.json(dishes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dishes" });
    }
  });

  // Get single dish
  app.get("/api/dishes/:id", async (req: Request, res: Response) => {
    try {
      const dish = await storage.getDish(req.params.id);
      if (!dish) {
        return res.status(404).json({ message: "Dish not found" });
      }
      res.json(dish);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dish" });
    }
  });

  // Create new dish
  app.post("/api/dishes", upload.single('image'), async (req: Request, res: Response) => {
    try {
      const dishData = insertDishSchema.parse({
        ...req.body,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined
      });
      
      const dish = await storage.createDish(dishData);
      res.status(201).json(dish);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create dish" });
      }
    }
  });

  // Update dish
  app.patch("/api/dishes/:id", upload.single('image'), async (req: Request, res: Response) => {
    try {
      const updates: any = { ...req.body };
      if (req.file) {
        updates.imageUrl = `/uploads/${req.file.filename}`;
      }
      
      const dish = await storage.updateDish(req.params.id, updates);
      if (!dish) {
        return res.status(404).json({ message: "Dish not found" });
      }
      res.json(dish);
    } catch (error) {
      res.status(500).json({ message: "Failed to update dish" });
    }
  });

  // Delete dish
  app.delete("/api/dishes/:id", async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteDish(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Dish not found" });
      }
      res.json({ message: "Dish deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete dish" });
    }
  });

  // Create order with email notification
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const { order, items } = req.body;
      
      // Validate order data
      const orderData = insertOrderSchema.parse(order);
      
      // Create the order
      const createdOrder = await storage.createOrder(orderData);
      
      // Create order items
      for (const item of items) {
        const orderItemData = insertOrderItemSchema.parse({
          ...item,
          orderId: createdOrder.id
        });
        await storage.createOrderItem(orderItemData);
      }
      
      // Send email notification
      const orderWithItems = await storage.getOrder(createdOrder.id);
      if (orderWithItems) {
        await sendOrderNotification(orderWithItems);
      }
      
      res.status(201).json(createdOrder);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create order" });
      }
    }
  });

  // Get all orders
  app.get("/api/orders", async (req: Request, res: Response) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get single order
  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function sendOrderNotification(order: any) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@dishorder.com";
  
  const itemsList = order.items.map((item: any) => 
    `- ${item.dish.name} (${item.dish.size}) × ${item.quantity} = ¥${(parseFloat(item.price) * item.quantity).toLocaleString()}`
  ).join('\n');

  const emailContent = `
新しい注文が入りました

注文番号: ${order.id}
注文日時: ${new Date(order.createdAt).toLocaleString('ja-JP')}

【お客様情報】
お名前: ${order.customerName}
メールアドレス: ${order.customerEmail}
電話番号: ${order.customerPhone}
配送先住所: ${order.customerAddress}
${order.notes ? `備考: ${order.notes}` : ''}

【注文内容】
${itemsList}

【金額】
小計: ¥${parseFloat(order.subtotal).toLocaleString()}
送料: ¥${parseFloat(order.shipping).toLocaleString()}
税込: ¥${parseFloat(order.tax).toLocaleString()}
合計: ¥${parseFloat(order.total).toLocaleString()}

支払い方法: ${order.paymentMethod}

---
お皿オーダーサイト
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER || process.env.EMAIL_USER,
      to: adminEmail,
      subject: `新規注文 - ${order.id}`,
      text: emailContent,
    });
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
}
