import { type User, type InsertUser, type LoginUser, type Salon, type InsertSalon, type Barber, type InsertBarber, type Service, type InsertService, type Appointment, type InsertAppointment, type Review, type InsertReview } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  validateUser(credentials: LoginUser): Promise<User | null>;

  // Salon operations
  createSalon(salon: InsertSalon & { ownerId: string }): Promise<Salon>;
  getSalons(): Promise<Salon[]>;
  getSalonById(id: string): Promise<Salon | undefined>;
  updateSalonApproval(id: string, isApproved: boolean): Promise<void>;

  // Barber operations
  createBarber(barber: InsertBarber & { userId: string; salonId: string }): Promise<Barber>;
  getBarberById(id: string): Promise<Barber | undefined>;
  getBarbersByUserId(userId: string): Promise<Barber | undefined>;
  getBarbersBySalon(salonId: string): Promise<Barber[]>;
  updateBarberAvailability(id: string, isAvailable: boolean): Promise<void>;

  // Service operations
  createService(service: InsertService & { barberId: string }): Promise<Service>;
  getServicesByBarber(barberId: string): Promise<Service[]>;
  getServiceById(id: string): Promise<Service | undefined>;

  // Appointment operations
  createAppointment(appointment: InsertAppointment & { customerId: string; totalPrice: string }): Promise<Appointment>;
  getAppointmentsByCustomer(customerId: string): Promise<(Appointment & { barber: Barber; service: Service; salon: Salon })[]>;
  getAppointmentsByBarber(barberId: string): Promise<(Appointment & { customer: User; service: Service })[]>;
  updateAppointmentStatus(id: string, status: "pending" | "confirmed" | "completed" | "cancelled"): Promise<void>;
  getAllAppointments(): Promise<(Appointment & { customer: User; barber: Barber; service: Service; salon: Salon })[]>;

  // Review operations
  createReview(review: InsertReview & { customerId: string }): Promise<Review>;
  getReviewsByBarber(barberId: string): Promise<(Review & { customer: User })[]>;

  // Admin operations
  getStats(): Promise<{
    totalUsers: number;
    totalSalons: number;
    totalAppointments: number;
    pendingSalons: number;
  }>;
  getAllUsers(): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private salons: Map<string, Salon> = new Map();
  private barbers: Map<string, Barber> = new Map();
  private services: Map<string, Service> = new Map();
  private appointments: Map<string, Appointment> = new Map();
  private reviews: Map<string, Review> = new Map();

  constructor() {
    this.seedData();
  }

  private async seedData() {
    // Create sample users
    const adminUser = await this.createUser({
      email: "admin@smartcut.com",
      password: "admin123",
      name: "Admin User",
      role: "admin",
    });

    const barberUser = await this.createUser({
      email: "marcus@smartcut.com",
      password: "barber123",
      name: "Marcus Johnson",
      phone: "(555) 123-4567",
      role: "barber",
    });

    const customerUser = await this.createUser({
      email: "john@example.com",
      password: "customer123",
      name: "John Smith",
      phone: "(555) 987-6543",
      role: "customer",
    });

    // Create sample salon
    const salon = await this.createSalon({
      name: "Premium Cuts",
      description: "A modern barbershop specializing in classic and contemporary cuts",
      address: "123 Main Street, Downtown",
      phone: "(555) 555-0123",
      email: "info@premiumcuts.com",
      ownerId: barberUser.id,
    });

    // Approve the salon
    await this.updateSalonApproval(salon.id, true);

    // Create barber profile
    const barber = await this.createBarber({
      userId: barberUser.id,
      salonId: salon.id,
      title: "Master Barber",
      bio: "Passionate barber specializing in modern cuts, beard grooming, and traditional hot towel shaves.",
      specialties: ["Fade Cuts", "Beard Styling", "Hot Towel Shave", "Hair Washing"],
      experience: 8,
      workingHours: {
        monday: { start: "09:00", end: "18:00" },
        tuesday: { start: "09:00", end: "18:00" },
        wednesday: { start: "09:00", end: "18:00" },
        thursday: { start: "09:00", end: "18:00" },
        friday: { start: "09:00", end: "18:00" },
        saturday: { start: "10:00", end: "16:00" },
      },
    });

    // Create services
    await this.createService({
      name: "Classic Haircut",
      description: "Professional cut with styling",
      duration: 45,
      price: "35.00",
      barberId: barber.id,
    });

    await this.createService({
      name: "Fade + Beard Trim",
      description: "Premium fade with beard styling",
      duration: 60,
      price: "55.00",
      barberId: barber.id,
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      id,
      email: insertUser.email,
      password: hashedPassword,
      name: insertUser.name,
      phone: insertUser.phone || null,
      role: insertUser.role || "customer",
      profileImage: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async validateUser(credentials: LoginUser): Promise<User | null> {
    const user = await this.getUserByEmail(credentials.email);
    if (!user) return null;
    
    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    return isValidPassword ? user : null;
  }

  async createSalon(salon: InsertSalon & { ownerId: string }): Promise<Salon> {
    const id = randomUUID();
    const newSalon: Salon = {
      id,
      name: salon.name,
      description: salon.description || null,
      address: salon.address,
      phone: salon.phone || null,
      email: salon.email || null,
      images: null,
      rating: "0",
      reviewCount: 0,
      isActive: true,
      isApproved: false,
      ownerId: salon.ownerId,
      createdAt: new Date(),
    };
    this.salons.set(id, newSalon);
    return newSalon;
  }

  async getSalons(): Promise<Salon[]> {
    return Array.from(this.salons.values()).filter(salon => salon.isApproved && salon.isActive);
  }

  async getSalonById(id: string): Promise<Salon | undefined> {
    return this.salons.get(id);
  }

  async updateSalonApproval(id: string, isApproved: boolean): Promise<void> {
    const salon = this.salons.get(id);
    if (salon) {
      salon.isApproved = isApproved;
      this.salons.set(id, salon);
    }
  }

  async createBarber(barber: InsertBarber & { userId: string; salonId: string }): Promise<Barber> {
    const id = randomUUID();
    const newBarber: Barber = {
      id,
      userId: barber.userId,
      salonId: barber.salonId,
      title: barber.title,
      bio: barber.bio || null,
      specialties: barber.specialties || null,
      experience: barber.experience || null,
      portfolio: null,
      rating: "0",
      reviewCount: 0,
      isAvailable: true,
      workingHours: barber.workingHours || null,
      createdAt: new Date(),
    };
    this.barbers.set(id, newBarber);
    return newBarber;
  }

  async getBarberById(id: string): Promise<Barber | undefined> {
    return this.barbers.get(id);
  }

  async getBarbersByUserId(userId: string): Promise<Barber | undefined> {
    return Array.from(this.barbers.values()).find(barber => barber.userId === userId);
  }

  async getBarbersBySalon(salonId: string): Promise<Barber[]> {
    return Array.from(this.barbers.values()).filter(barber => barber.salonId === salonId);
  }

  async updateBarberAvailability(id: string, isAvailable: boolean): Promise<void> {
    const barber = this.barbers.get(id);
    if (barber) {
      barber.isAvailable = isAvailable;
      this.barbers.set(id, barber);
    }
  }

  async createService(service: InsertService & { barberId: string }): Promise<Service> {
    const id = randomUUID();
    const newService: Service = {
      id,
      barberId: service.barberId,
      name: service.name,
      description: service.description || null,
      duration: service.duration,
      price: service.price,
      isActive: true,
    };
    this.services.set(id, newService);
    return newService;
  }

  async getServicesByBarber(barberId: string): Promise<Service[]> {
    return Array.from(this.services.values()).filter(service => service.barberId === barberId && service.isActive);
  }

  async getServiceById(id: string): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createAppointment(appointment: InsertAppointment & { customerId: string; totalPrice: string }): Promise<Appointment> {
    const id = randomUUID();
    const newAppointment: Appointment = {
      id,
      customerId: appointment.customerId,
      barberId: appointment.barberId,
      serviceId: appointment.serviceId,
      appointmentDate: appointment.appointmentDate,
      status: "pending",
      notes: appointment.notes || null,
      totalPrice: appointment.totalPrice,
      createdAt: new Date(),
    };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async getAppointmentsByCustomer(customerId: string): Promise<(Appointment & { barber: Barber; service: Service; salon: Salon })[]> {
    const customerAppointments = Array.from(this.appointments.values())
      .filter(appointment => appointment.customerId === customerId);
    
    return customerAppointments.map(appointment => {
      const barber = this.barbers.get(appointment.barberId)!;
      const service = this.services.get(appointment.serviceId)!;
      const salon = this.salons.get(barber.salonId)!;
      return { ...appointment, barber, service, salon };
    });
  }

  async getAppointmentsByBarber(barberId: string): Promise<(Appointment & { customer: User; service: Service })[]> {
    const barberAppointments = Array.from(this.appointments.values())
      .filter(appointment => appointment.barberId === barberId);
    
    return barberAppointments.map(appointment => {
      const customer = this.users.get(appointment.customerId)!;
      const service = this.services.get(appointment.serviceId)!;
      return { ...appointment, customer, service };
    });
  }

  async updateAppointmentStatus(id: string, status: "pending" | "confirmed" | "completed" | "cancelled"): Promise<void> {
    const appointment = this.appointments.get(id);
    if (appointment) {
      appointment.status = status;
      this.appointments.set(id, appointment);
    }
  }

  async getAllAppointments(): Promise<(Appointment & { customer: User; barber: Barber; service: Service; salon: Salon })[]> {
    return Array.from(this.appointments.values()).map(appointment => {
      const customer = this.users.get(appointment.customerId)!;
      const barber = this.barbers.get(appointment.barberId)!;
      const service = this.services.get(appointment.serviceId)!;
      const salon = this.salons.get(barber.salonId)!;
      return { ...appointment, customer, barber, service, salon };
    });
  }

  async createReview(review: InsertReview & { customerId: string }): Promise<Review> {
    const id = randomUUID();
    const newReview: Review = {
      id,
      customerId: review.customerId,
      barberId: review.barberId,
      appointmentId: review.appointmentId,
      rating: review.rating,
      comment: review.comment || null,
      createdAt: new Date(),
    };
    this.reviews.set(id, newReview);
    return newReview;
  }

  async getReviewsByBarber(barberId: string): Promise<(Review & { customer: User })[]> {
    const barberReviews = Array.from(this.reviews.values())
      .filter(review => review.barberId === barberId);
    
    return barberReviews.map(review => {
      const customer = this.users.get(review.customerId)!;
      return { ...review, customer };
    });
  }

  async getStats(): Promise<{
    totalUsers: number;
    totalSalons: number;
    totalAppointments: number;
    pendingSalons: number;
  }> {
    return {
      totalUsers: this.users.size,
      totalSalons: Array.from(this.salons.values()).filter(s => s.isApproved).length,
      totalAppointments: this.appointments.size,
      pendingSalons: Array.from(this.salons.values()).filter(s => !s.isApproved).length,
    };
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}

export const storage = new MemStorage();
