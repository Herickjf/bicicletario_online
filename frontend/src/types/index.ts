export type UserRole = 'owner' | 'manager' | 'attendant' | 'customer';

export type BikeStatus = 'available' | 'rented' | 'under_maintenance';

export type RentStatus = 'active' | 'finished' | 'canceled';

export interface Address {
  address_id: number;
  street: string;
  num?: number;
  zip_code: string;
  city: string;
  state: string;
}

export interface BikeRack {
  bike_rack_id: number;
  name: string;
  image?: string;
  address_id?: number;
  address?: Address;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address_id: number;
  address?: Address;
}

export interface UserRoleAssignment {
  user_id: number;
  bike_rack_id: number;
  role: UserRole;
}

export interface Bike {
  bike_id: number;
  model: string;
  year?: number;
  image?: string;
  rent_price: number;
  status: BikeStatus;
  tracker_number: number;
  bike_rack_id: number;
}

export interface Plan {
  plan_id: number;
  name: string;
  description?: string;
  price: number;
  bike_rack_id: number;
}

export interface Rent {
  rent_id: number;
  rent_date: string;
  init_time: string;
  end_time: string;
  total_value: number;
  status: RentStatus;
  bike_id?: number;
  client_id?: number;
  employee_id?: number;
  bike_rack_id: number;
  bike?: Bike;
  client?: User;
  employee?: User;
}

export interface DashboardStats {
  totalBikes: number;
  availableBikes: number;
  activeRentals: number;
  totalRevenue: number;
  monthlyRevenue: number;
}