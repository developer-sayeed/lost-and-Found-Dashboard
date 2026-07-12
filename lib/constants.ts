import type { ItemCategory, ItemLocation, User, HotelSettings } from "./types";

export const CATEGORIES: ItemCategory[] = [
  "Electronics",
  "Clothing",
  "Documents",
  "Jewelry",
  "Bags",
  "Foods",
  "Medicines",
  "Personal Items",
  "Other",
];

export const LOCATIONS: ItemLocation[] = [
  "Room",
  "Lobby",
  "Restaurant",
  "Pool",
  "Gym",
  "Spa",
  "Bar",
  "Conference Room",
  "Parking",
  "Garden",
  "Other",
];

export const STORAGE_KEYS = {
  USERS: "lf_users",
  ITEMS: "lf_items",
  SETTINGS: "lf_settings",
  SESSION: "lf_session",
} as const;

export const DEFAULT_SUPER_ADMIN: User = {
  id: "admin-001",
  email: "abusayeedriday@gmail.com",
  password: "587710",
  name: "Abu Sayeed Riday",
  role: "super_admin",
  department: "Administration",
  createdAt: new Date().toISOString(),
  isActive: true,
};

export const DEFAULT_SETTINGS: HotelSettings = {
  hotelName: "Warwick Hotels and Resorts",
  hotelAddress: "123 Hotel Boulevard, City, Country",
  hotelPhone: "+1 (555) 123-4567",
  hotelEmail: "info@warwickhotels.com",
  hotelWebsite: "www.warwickhotels.com",
  logo: "/images/warwick-logo.png",
  otherLinks: [],
};

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  supervisor: "Supervisor",
  manager: "Manager",
  employee: "Employee",
};

export const STATUS_LABELS: Record<string, string> = {
  stored: "Stored",
  handed_over: "Handed Over",
  dispatched: "Dispatched",
};

export const ROLE_PERMISSIONS = {
  super_admin: {
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canHandover: true,
    canDispatch: true,
    canManageUsers: true,
    canAccessSettings: true,
  },
  supervisor: {
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canHandover: true,
    canDispatch: true,
    canManageUsers: false,
    canAccessSettings: true,
  },
  manager: {
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canHandover: true,
    canDispatch: true,
    canManageUsers: false,
    canAccessSettings: true,
  },
  employee: {
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canHandover: true,
    canDispatch: false,
    canManageUsers: false,
    canAccessSettings: false,
  },
} as const;
