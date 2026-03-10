export type Role = "ADMIN" | "MANAGER" | "VIEWER";

export const HARDCODED_USERS = [
  { id: "1", name: "Admin User",   email: "admin@ims.com",   password: "admin123",   role: "ADMIN"   as Role },
  { id: "2", name: "Store Manager",email: "manager@ims.com", password: "manager123", role: "MANAGER" as Role },
  { id: "3", name: "Viewer Only",  email: "viewer@ims.com",  password: "viewer123",  role: "VIEWER"  as Role },
];

export const mockCategories = [
  { id: "cat1", name: "Electronics" },
  { id: "cat2", name: "Furniture"   },
  { id: "cat3", name: "Stationery"  },
  { id: "cat4", name: "Clothing"    },
];

export const mockVendors = [
  { id: "v1", name: "TechSupply Co.", email: "tech@supply.com",   phone: "+91 98765 43210", address: "Mumbai, MH"    },
  { id: "v2", name: "OfficeWorld",    email: "office@world.com",  phone: "+91 87654 32109", address: "Bangalore, KA" },
  { id: "v3", name: "FabricHouse",   email: "fab@house.com",     phone: "+91 76543 21098", address: "Surat, GJ"     },
];

export const mockProducts = [
  {
    id: "p1", name: "Wireless Mouse", sku: "ELEC-001",
    categoryId: "cat1", quantity: 45, threshold: 10, vendorId: "v1",
    description: "Ergonomic wireless mouse with 2.4GHz connectivity and 12-month battery life.",
    price: 849.00,
    supplierName: "TechSupply Co.",
  },
  {
    id: "p2", name: "Mechanical Keyboard", sku: "ELEC-002",
    categoryId: "cat1", quantity: 8, threshold: 10, vendorId: "v1",
    description: "Tenkeyless mechanical keyboard with Cherry MX Blue switches and RGB backlight.",
    price: 3499.00,
    supplierName: "TechSupply Co.",
  },
  {
    id: "p3", name: "Office Chair", sku: "FURN-001",
    categoryId: "cat2", quantity: 5, threshold: 8, vendorId: "v2",
    description: "Adjustable ergonomic office chair with lumbar support and breathable mesh back.",
    price: 12999.00,
    supplierName: "OfficeWorld",
  },
  {
    id: "p4", name: "Standing Desk", sku: "FURN-002",
    categoryId: "cat2", quantity: 3, threshold: 5, vendorId: "v2",
    description: "Electric height-adjustable standing desk, 140x70cm surface area.",
    price: 24999.00,
    supplierName: "OfficeWorld",
  },
  {
    id: "p5", name: "A4 Paper Ream", sku: "STAT-001",
    categoryId: "cat3", quantity: 120, threshold: 20, vendorId: "v2",
    description: "500 sheets of 80gsm A4 premium white paper, acid-free and archival quality.",
    price: 349.00,
    supplierName: "OfficeWorld",
  },
  {
    id: "p6", name: "Ball Pen Box", sku: "STAT-002",
    categoryId: "cat3", quantity: 200, threshold: 30, vendorId: "v2",
    description: "Box of 50 smooth-writing ballpoint pens, blue ink, medium tip.",
    price: 199.00,
    supplierName: "OfficeWorld",
  },
  {
    id: "p7", name: 'Monitor 24"', sku: "ELEC-003",
    categoryId: "cat1", quantity: 6, threshold: 5, vendorId: "v1",
    description: "24-inch Full HD IPS monitor, 75Hz refresh rate, HDMI + VGA ports.",
    price: 13499.00,
    supplierName: "TechSupply Co.",
  },
  {
    id: "p8", name: "Cotton T-Shirt", sku: "CLTH-001",
    categoryId: "cat4", quantity: 2, threshold: 15, vendorId: "v3",
    description: "100% pure cotton unisex t-shirt, available in S/M/L/XL, multiple colours.",
    price: 499.00,
    supplierName: "FabricHouse",
  },
];

export const mockStockEntries = [
  { id: "s1", productId: "p1", type: "STOCK_IN"  as const, quantity: 20, note: "Monthly restock",    performedBy: "Admin User",   createdAt: "2026-03-01T10:00:00Z" },
  { id: "s2", productId: "p2", type: "STOCK_OUT" as const, quantity: 5,  note: "Office use",         performedBy: "Store Manager",createdAt: "2026-03-02T11:30:00Z" },
  { id: "s3", productId: "p3", type: "STOCK_IN"  as const, quantity: 3,  note: "New order",          performedBy: "Admin User",   createdAt: "2026-03-03T09:00:00Z" },
  { id: "s4", productId: "p5", type: "STOCK_OUT" as const, quantity: 10, note: "Printing dept",      performedBy: "Store Manager",createdAt: "2026-03-04T14:00:00Z" },
  { id: "s5", productId: "p8", type: "STOCK_OUT" as const, quantity: 8,  note: "Sales order #123",   performedBy: "Admin User",   createdAt: "2026-03-05T16:00:00Z" },
  { id: "s6", productId: "p7", type: "STOCK_IN"  as const, quantity: 4,  note: "Vendor delivery",    performedBy: "Store Manager",createdAt: "2026-03-06T12:00:00Z" },
];

export const mockPurchaseEntries = [
  { id: "pe1", vendorId: "v1", amount: 45000, note: "Q1 Electronics order",      createdAt: "2026-02-15T10:00:00Z" },
  { id: "pe2", vendorId: "v2", amount: 12000, note: "Office supplies restock",   createdAt: "2026-02-20T11:00:00Z" },
  { id: "pe3", vendorId: "v1", amount: 28000, note: "Monitor batch purchase",    createdAt: "2026-03-01T09:00:00Z" },
  { id: "pe4", vendorId: "v3", amount: 8500,  note: "Clothing stock",            createdAt: "2026-03-05T14:00:00Z" },
];
