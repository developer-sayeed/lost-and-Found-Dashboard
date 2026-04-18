export type UserRole = 'super_admin' | 'supervisor' | 'manager' | 'employee'

export type ItemStatus = 'stored' | 'handed_over' | 'dispatched'

export type ItemCategory = 
  | 'Electronics'
  | 'Clothing'
  | 'Documents'
  | 'Jewelry'
  | 'Bags'
  | 'Personal Items'
  | 'Other'

export type ItemLocation = 
  | 'Lobby'
  | 'Restaurant'
  | 'Pool'
  | 'Gym'
  | 'Spa'
  | 'Bar'
  | 'Conference Room'
  | 'Room'
  | 'Parking'
  | 'Garden'
  | 'Other'

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
  department?: string
  phone?: string
  createdAt: string
  isActive: boolean
}

export interface LostItem {
  id: string
  code: string
  dateFound: string
  itemDescription: string
  category: ItemCategory
  location: ItemLocation
  roomNumber?: string
  guestName: string
  finderName: string
  recordedBy: string
  storeLocation: string
  dispatchDuration: number
  status: ItemStatus
  handoverDate?: string
  handoverBy?: string
  handoverContactNumber?: string
  handoverReceiverName?: string
  dispatchDate?: string
  dispatchBy?: string
  createdAt: string
  updatedAt: string
}

export interface HotelSettings {
  hotelName: string
  hotelAddress: string
  hotelPhone: string
  hotelEmail: string
  hotelWebsite: string
  logo: string
  otherLinks: { label: string; url: string }[]
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}
