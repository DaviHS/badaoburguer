import { pgTable, serial, varchar, text, numeric, integer, boolean, timestamp, smallint } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  userId: serial("user_id").primaryKey(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  cpf: varchar("cpf", { length: 14 }),
  birthDate: timestamp("birth_date", { mode: "date" }),
  status: smallint("status").default(1), // 0=inativo, 1=ativo
  type: smallint("type").default(0), // 0=cliente, 1=admin
  passwordHash: varchar("password_hash", { length: 100 }).notNull(),
  passwordCreatedAt: timestamp("password_created_at", { mode: "date", withTimezone: true }),
  passwordUpdatedAt: timestamp("password_updated_at", { mode: "date", withTimezone: true }),
  enrollmentNumber: varchar("enrollment_number", { length: 20 }),
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow(),
  resetToken: varchar("reset_token", { length: 100 }),
  resetTokenExpires: timestamp("reset_token_expires", { mode: "date", withTimezone: true }),
})

export const categories = pgTable("categories", {
  categoryId: serial("category_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  description: text("description"),
  status: smallint("status").default(1),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow(),
})

export const products = pgTable("products", {
  productId: serial("product_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  minStock: integer("min_stock").notNull().default(0),
  categoryId: integer("category_id").references(() => categories.categoryId),
  status: smallint("status").default(1),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow(),
})

export const productImages = pgTable("product_images", {
  imageId: serial("image_id").primaryKey(),
  productId: integer("product_id").references(() => products.productId).notNull(),
  url: text("url").notNull(), // URL do arquivo armazenado pelo UploadThing
  fileName: varchar("file_name", { length: 200 }),
  fileSize: integer("file_size"), // em bytes
  order: integer("order").default(0), // nova coluna para definir a ordem das imagens
  status: smallint("status").default(1), // 0=inativo, 1=ativo
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow(),
}); 

export const orders = pgTable("orders", {
  orderId: serial("order_id").primaryKey(),
  userId: integer("user_id").references(() => users.userId),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  status: smallint("status")
    .references(() => orderStatus.statusId)
    .default(0),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow(),
})

export const orderItems = pgTable("order_items", {
  orderItemId: serial("order_item_id").primaryKey(),
  orderId: integer("order_id").references(() => orders.orderId),
  productId: integer("product_id").references(() => products.productId),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow(),
})

export const orderStatus = pgTable("order_status", {
  statusId: smallint("status_id").primaryKey(), 
  name: varchar("name", { length: 50 }).notNull(), 
  description: varchar("description", { length: 200 }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow(),
})