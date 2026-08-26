import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  orgCode: text("org_code").unique(), // e.g. GS-001
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const organizationMembers = pgTable("organization_members", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  memberCode: text("member_code"), // e.g. AI-TM-001
  phone: text("phone"), // e.g. +91 9876543210
  designation: text("designation"), // e.g. Business Development Intern
  department: text("department"), // e.g. Sales & Marketing
  employmentType: text("employment_type"), // Full-Time, Part-Time, Intern, Contract
  workLocation: text("work_location"), // Office, Remote, Hybrid
  salary: integer("salary"), // Monthly CTC / Stipend in ₹
  joiningDate: text("joining_date"), // e.g. 2026-08-01
  dob: text("dob"), // Date of Birth
  bloodGroup: text("blood_group"), // Blood Group
  emergencyContact: text("emergency_contact"), // Emergency Contact Name & Phone
  panNumber: text("pan_number"), // PAN
  aadhaarNumber: text("aadhaar_number"), // Aadhaar
  bankDetails: text("bank_details"), // Account No & IFSC
  address: text("address"), // Permanent / Current Address
  notes: text("notes"),
  status: text("status").notNull().default("active"), // 'active', 'inactive', 'on_leave'
  targetConversions: integer("target_conversions").default(0), // Monthly conversion goal (number of leads)
  targetRevenue: integer("target_revenue").default(0), // Monthly revenue goal in ₹
  commissionRate: integer("commission_rate").default(0), // Commission percentage (e.g. 5%)
  shiftStart: text("shift_start").default("09:00"), // Shift Start Time (24h format HH:MM)
  shiftEnd: text("shift_end").default("18:00"), // Shift End Time (24h format HH:MM)
  role: text("role").notNull().default("member"), // 'owner', 'manager', 'executive', 'custom'
  reportsToId: integer("reports_to_id"), // Future Hierarchy: Points to manager/TL member id (null = reports to Founder)
  permissions: text("permissions").notNull().default("{}"), // JSON string of custom permissions
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  // Basic Info
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  company: text("company"),
  industry: text("industry"),
  // Lead Details
  source: text("source"),          // WhatsApp, Email, Website, Referral, Cold Call, etc.
  requirement: text("requirement"), // What they need
  budget: integer("budget"),        // Budget in INR
  priority: text("priority").default("Medium"), // Low, Medium, High, Urgent
  // Pipeline
  status: text("status").notNull().default("New Lead"), // New Lead, First Contact, etc.
  // AI Score (0-100)
  aiScore: integer("ai_score").default(0),
  // Extra & Custom Fields Data (JSON storing dynamic custom fields per industry)
  customFieldsData: text("custom_fields_data").default("{}"),
  notes: text("notes"),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  assignedTo: integer("assigned_to").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leadActivities = pgTable("lead_activities", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text("type").notNull().default("Note"), // Note, Call, Status Change, Assignment
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quotations = pgTable("quotations", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text("status").notNull().default("Draft"), // Draft, Sent, Accepted, Rejected
  subtotal: integer("subtotal").notNull().default(0),
  taxTotal: integer("tax_total").notNull().default(0),
  total: integer("total").notNull().default(0),
  // We can store items as a JSON array for simplicity in MVP, or a separate table.
  // Using jsonb for items (name, price, qty, tax) is easier to manage without complex cascading.
  items: text("items").notNull().default("[]"), // JSON stringified array of items
  terms: text("terms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const agreements = pgTable("agreements", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text("status").notNull().default("Draft"), // Draft, Sent, Signed
  content: text("content").notNull(), // JSON storing custom terms, jurisdiction, scope, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Jira-Style Projects & Sprint / Bug Tracker Schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g. Anavya CRM Portal
  code: text("code").notNull(), // e.g. ANV-PRJ-001 or CRM
  description: text("description"),
  clientId: integer("client_id").references(() => clients.id, { onDelete: 'set null' }),
  status: text("status").notNull().default("In Progress"), // Planning, In Progress, In Review, On Hold, Completed
  priority: text("priority").notNull().default("High"), // Low, Medium, High, Urgent
  techStack: text("tech_stack"), // e.g. Next.js, PostgreSQL, Node.js
  startDate: text("start_date"),
  deadline: text("deadline"),
  budget: integer("budget").default(0), // Budget in ₹
  projectManagerId: integer("project_manager_id").references(() => users.id, { onDelete: 'set null' }),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectTasks = pgTable("project_tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  taskCode: text("task_code").notNull(), // e.g. ANV-101, GEET-204
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull().default("Task"), // Bug, Story, Task, Improvement
  status: text("status").notNull().default("To Do"), // Backlog, To Do, In Progress, Code Review, Testing, Done
  priority: text("priority").notNull().default("Medium"), // Highest, High, Medium, Low
  assigneeId: integer("assignee_id").references(() => users.id, { onDelete: 'set null' }),
  reporterId: integer("reporter_id").references(() => users.id, { onDelete: 'set null' }),
  estimatedHours: integer("estimated_hours").default(0),
  loggedHours: integer("logged_hours").default(0),
  dueDate: text("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Enterprise GST Tax Invoices & Billing Schema
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull(), // e.g. INV-2026-001
  clientId: integer("client_id").notNull().references(() => clients.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  status: text("status").notNull().default("Sent"), // Draft, Sent, Partially Paid, Paid, Overdue
  issueDate: text("issue_date").notNull(), // YYYY-MM-DD
  dueDate: text("due_date").notNull(), // YYYY-MM-DD
  subtotal: integer("subtotal").notNull().default(0), // Total before tax in ₹
  taxTotal: integer("tax_total").notNull().default(0), // Total GST tax in ₹
  discountTotal: integer("discount_total").notNull().default(0), // Total discount in ₹
  total: integer("total").notNull().default(0), // Grand Total in ₹
  amountPaid: integer("amount_paid").notNull().default(0), // Paid amount in ₹
  amountDue: integer("amount_due").notNull().default(0), // Outstanding balance in ₹
  paymentMethod: text("payment_method"), // Bank Transfer, UPI, Cheque, Cash, Credit Card
  items: text("items").notNull().default("[]"), // JSON stringified array of line items
  notes: text("notes"),
  terms: text("terms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Internal Employee & Client Support Ticketing System Schema
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  ticketCode: text("ticket_code").notNull(), // e.g. TCK-2026-101
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  userName: text("user_name").notNull(),
  userRole: text("user_role").notNull(),
  subject: text("subject").notNull(),
  category: text("category").notNull(), // Technical Support, Lead Issue, Billing Query, Bug Report, General
  priority: text("priority").notNull().default("Normal"), // Low, Normal, High, Urgent
  status: text("status").notNull().default("Open"), // Open, In Progress, Resolved, Closed
  description: text("description").notNull(),
  reply: text("reply"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dynamic Custom Fields Engine Schema (Supports 100+ Business Industries)
export const customFields = pgTable("custom_fields", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  module: text("module").notNull().default("leads"), // 'leads', 'clients', 'projects', 'invoices'
  fieldName: text("field_name").notNull(), // Machine identifier key e.g. property_type
  fieldLabel: text("field_label").notNull(), // UI Display Label e.g. Property Type
  fieldType: text("field_type").notNull().default("text"), // 'text', 'number', 'select', 'date', 'boolean', 'textarea'
  options: text("options").default("[]"), // JSON array string for select dropdown options e.g. ["1 BHK", "2 BHK"]
  isRequired: text("is_required").default("false"), // 'true' or 'false'
  industryType: text("industry_type").default("General"), // 'Real Estate', 'Healthcare', 'IT', 'Solar', 'B2B', 'Education', 'Finance'
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


