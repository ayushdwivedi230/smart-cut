import type { Express } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { insertUserSchema, loginUserSchema, insertSalonSchema, insertBarberSchema, insertServiceSchema, insertAppointmentSchema, insertReviewSchema } from "@shared/schema";

const JWT_SECRET = process.env.SESSION_SECRET || "fallback_secret_key";

interface AuthRequest extends Express.Request {
  user?: { id: string; role: string };
}

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Middleware to check admin role
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Middleware to check barber role
const requireBarber = (req: any, res: any, next: any) => {
  if (req.user?.role !== "barber") {
    return res.status(403).json({ message: "Barber access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
      
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginUserSchema.parse(req.body);
      const user = await storage.validateUser(credentials);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
      
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          role: user.role 
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Salon routes
  app.get("/api/salons", async (req, res) => {
    try {
      const salons = await storage.getSalons();
      res.json(salons);
    } catch (error) {
      res.status(500).json({ message: "Error fetching salons" });
    }
  });

  app.get("/api/salons/:id", async (req, res) => {
    try {
      const salon = await storage.getSalonById(req.params.id);
      if (!salon) {
        return res.status(404).json({ message: "Salon not found" });
      }
      
      const barbers = await storage.getBarbersBySalon(salon.id);
      res.json({ salon, barbers });
    } catch (error) {
      res.status(500).json({ message: "Error fetching salon" });
    }
  });

  app.post("/api/salons", authenticateToken, requireBarber, async (req: any, res) => {
    try {
      const salonData = insertSalonSchema.parse(req.body);
      const salon = await storage.createSalon({ ...salonData, ownerId: req.user.id });
      res.json(salon);
    } catch (error) {
      res.status(400).json({ message: "Invalid salon data" });
    }
  });

  // Barber routes
  app.get("/api/barbers/:id", async (req, res) => {
    try {
      const barber = await storage.getBarberById(req.params.id);
      if (!barber) {
        return res.status(404).json({ message: "Barber not found" });
      }
      
      const services = await storage.getServicesByBarber(barber.id);
      const reviews = await storage.getReviewsByBarber(barber.id);
      const salon = await storage.getSalonById(barber.salonId);
      
      res.json({ barber, services, reviews, salon });
    } catch (error) {
      res.status(500).json({ message: "Error fetching barber" });
    }
  });

  app.post("/api/barbers", authenticateToken, requireBarber, async (req: any, res) => {
    try {
      const barberData = insertBarberSchema.parse(req.body);
      const barber = await storage.createBarber({ 
        ...barberData, 
        userId: req.user.id,
        salonId: req.body.salonId 
      });
      res.json(barber);
    } catch (error) {
      res.status(400).json({ message: "Invalid barber data" });
    }
  });

  app.get("/api/barbers/:id/services", async (req, res) => {
    try {
      const services = await storage.getServicesByBarber(req.params.id);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Error fetching services" });
    }
  });

  app.post("/api/services", authenticateToken, requireBarber, async (req: any, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const barber = await storage.getBarbersByUserId(req.user.id);
      
      if (!barber) {
        return res.status(404).json({ message: "Barber profile not found" });
      }

      const service = await storage.createService({
        ...serviceData,
        barberId: barber.id
      });
      res.json(service);
    } catch (error) {
      res.status(400).json({ message: "Invalid service data" });
    }
  });

  // Appointment routes
  app.post("/api/appointments", authenticateToken, async (req: any, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const service = await storage.getServiceById(appointmentData.serviceId);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      const appointment = await storage.createAppointment({
        ...appointmentData,
        customerId: req.user.id,
        totalPrice: service.price,
      });
      
      res.json(appointment);
    } catch (error) {
      res.status(400).json({ message: "Invalid appointment data" });
    }
  });

  app.get("/api/appointments/my", authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role === "customer") {
        const appointments = await storage.getAppointmentsByCustomer(req.user.id);
        res.json(appointments);
      } else if (req.user.role === "barber") {
        const barber = await storage.getBarbersByUserId(req.user.id);
        if (!barber) {
          return res.status(404).json({ message: "Barber profile not found" });
        }
        const appointments = await storage.getAppointmentsByBarber(barber.id);
        res.json(appointments);
      } else {
        res.status(403).json({ message: "Invalid role for this endpoint" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching appointments" });
    }
  });

  app.patch("/api/appointments/:id/status", authenticateToken, async (req: any, res) => {
    try {
      const { status } = req.body;
      await storage.updateAppointmentStatus(req.params.id, status);
      res.json({ message: "Appointment status updated" });
    } catch (error) {
      res.status(500).json({ message: "Error updating appointment" });
    }
  });

  // Review routes
  app.post("/api/reviews", authenticateToken, async (req: any, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview({
        ...reviewData,
        customerId: req.user.id,
      });
      res.json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching stats" });
    }
  });

  app.get("/api/admin/appointments", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const appointments = await storage.getAllAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching appointments" });
    }
  });

  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.patch("/api/admin/salons/:id/approve", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { isApproved } = req.body;
      await storage.updateSalonApproval(req.params.id, isApproved);
      res.json({ message: "Salon approval status updated" });
    } catch (error) {
      res.status(500).json({ message: "Error updating salon approval" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
