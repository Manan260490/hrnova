// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  currentId;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.currentId = 1;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var contactInquiries = pgTable("contact_inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  interest: text("interest").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertContactSchema = createInsertSchema(contactInquiries).pick({
  name: true,
  email: true,
  company: true,
  interest: true,
  message: true
});
var demoRequests = pgTable("demo_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  phone: text("phone"),
  productInterest: text("product_interest").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertDemoRequestSchema = createInsertSchema(demoRequests).pick({
  name: true,
  email: true,
  company: true,
  phone: true,
  productInterest: true,
  message: true
});

// server/routes.ts
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
async function registerRoutes(app2) {
  app2.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContactInquiry(validatedData);
      res.status(201).json({ success: true, message: "Contact inquiry created successfully", data: contact });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ success: false, message: validationError.message });
      } else {
        console.error("Error creating contact inquiry:", error);
        res.status(500).json({ success: false, message: "Failed to create contact inquiry" });
      }
    }
  });
  app2.post("/api/request-demo", async (req, res) => {
    try {
      const validatedData = insertDemoRequestSchema.parse(req.body);
      const demoRequest = await storage.createDemoRequest(validatedData);
      res.status(201).json({ success: true, message: "Demo request created successfully", data: demoRequest });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ success: false, message: validationError.message });
      } else {
        console.error("Error creating demo request:", error);
        res.status(500).json({ success: false, message: "Failed to create demo request" });
      }
    }
  });
  app2.get("/api/products", (req, res) => {
    const products = [
      {
        id: "hrms",
        title: "HRMS System",
        description: "Comprehensive human resource management system for modern organizations.",
        features: [
          "Employee profiles & records",
          "Leave & attendance management",
          "Performance reviews",
          "Onboarding & offboarding workflows",
          "Document management"
        ]
      },
      {
        id: "payroll",
        title: "Payroll Management",
        description: "Streamline your payroll process with our automated system.",
        features: [
          "Automated tax calculations",
          "Salary processing & direct deposits",
          "Compliance & reporting",
          "Payroll analytics",
          "Benefits administration"
        ]
      },
      {
        id: "tracking",
        title: "Employee Tracking",
        description: "Monitor productivity and engagement across your organization.",
        features: [
          "Time tracking & activity monitoring",
          "Productivity analytics",
          "Project progress tracking",
          "Remote work monitoring",
          "Goal setting and tracking"
        ]
      }
    ];
    res.status(200).json(products);
  });
  app2.get("/api/products/:id", (req, res) => {
    const productId = req.params.id;
    const products = {
      hrms: {
        id: "hrms",
        title: "HRMS System",
        description: "Comprehensive human resource management system for modern organizations.",
        features: [
          "Employee profiles & records",
          "Leave & attendance management",
          "Performance reviews",
          "Onboarding & offboarding workflows",
          "Document management",
          "Organization charts",
          "Employee self-service portal"
        ],
        benefits: [
          {
            title: "Centralized Employee Data",
            description: "Keep all employee information in one secure, easily accessible location."
          },
          {
            title: "Automated HR Processes",
            description: "Reduce paperwork and manual tasks with automated workflows."
          },
          {
            title: "Enhanced Compliance",
            description: "Stay up-to-date with labor laws and regulations with built-in compliance tools."
          }
        ]
      },
      payroll: {
        id: "payroll",
        title: "Payroll Management",
        description: "Streamline your payroll process with our automated system.",
        features: [
          "Automated tax calculations",
          "Salary processing & direct deposits",
          "Compliance & reporting",
          "Payroll analytics",
          "Benefits administration",
          "Expense management",
          "Multi-country payroll support"
        ],
        benefits: [
          {
            title: "Error-Free Calculations",
            description: "Eliminate manual calculation errors with automated payroll processing."
          },
          {
            title: "Tax Compliance",
            description: "Stay compliant with automatic tax calculations and filing assistance."
          },
          {
            title: "Time Savings",
            description: "Reduce payroll processing time from days to hours with automation."
          }
        ]
      },
      tracking: {
        id: "tracking",
        title: "Employee Tracking",
        description: "Monitor productivity and engagement across your organization.",
        features: [
          "Time tracking & activity monitoring",
          "Productivity analytics",
          "Project progress tracking",
          "Remote work monitoring",
          "Goal setting and tracking",
          "Performance metrics",
          "Team collaboration insights"
        ],
        benefits: [
          {
            title: "Increased Productivity",
            description: "Identify bottlenecks and optimize workflows for better productivity."
          },
          {
            title: "Data-Driven Management",
            description: "Make informed decisions based on accurate performance metrics."
          },
          {
            title: "Remote Work Optimization",
            description: "Successfully manage remote teams with visibility into work patterns."
          }
        ]
      }
    };
    const product = products[productId];
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  const host = process.platform === "win32" ? "localhost" : "0.0.0.0";
  const serverOptions = process.platform === "win32" ? { port, host } : { port, host, reusePort: true };
  server.listen(serverOptions, () => {
    log(`serving on port ${port} at ${host}`);
  });
})();
