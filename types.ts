
export enum VehicleStatus {
  FOR_SALE = 'Satılık',
  SOLD = 'Satıldı',
  RESERVED = 'Opsiyonlu',
  CONSIGNMENT = 'Konsinye (B2B)'
}

export enum FuelType {
  DIESEL = 'Dizel',
  GASOLINE = 'Benzin',
  HYBRID = 'Hibrit',
  ELECTRIC = 'Elektrik'
}

export enum Transmission {
  MANUAL = 'Manuel',
  AUTOMATIC = 'Otomatik'
}

export enum DamageStatus {
  ORIGINAL = 'original',
  LOCAL_PAINTED = 'local_painted',
  PAINTED = 'painted',
  CHANGED = 'changed'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Dealer {
  id: string;
  name: string;
  location: Coordinates;
  address: string;
  phone: string;
  rating: number;
}

export interface ExpertiseReport {
  [partId: string]: DamageStatus;
}

export interface VehicleLocation {
  city: string;
  district: string;
  neighborhood: string;
}

export interface VehicleFeatures {
  [category: string]: {
    [feature: string]: boolean;
  };
}

export interface VehicleTechSpecs {
  segment?: string;
  cylinders?: string;
  fuelConsumptionCity?: string;
  fuelConsumptionHighway?: string;
  fuelConsumptionMix?: string;
  torque?: string;
  acceleration?: string;
  topSpeed?: string;
  tankCapacity?: string;
  weight?: string;
  trunkCapacity?: string;
  dimensions?: string; // LxWxH
  tireSize?: string;
}

export interface Vehicle {
  id: string;
  dealerId: string;
  title: string; // "TR'NİN EN UCUZU"
  category: string; 
  plate?: string;
  plateCountry?: string;
  brand: string;
  model: string;
  series: string;
  year: number;
  price: number;
  b2bPrice?: number;
  mileage: number;
  fuel: FuelType;
  transmission: Transmission;
  status: VehicleStatus;
  
  // Technical Specs
  bodyType: string;
  enginePower: number;
  engineVolume: number;
  traction: string;
  color: string;
  warranty: boolean;
  heavyDamage: boolean;
  exchange: boolean;
  fromWho: 'Galeriden' | 'Sahibinden' | 'Yetkili Bayiden'; // Kimden

  // Detailed Specs & Features
  techSpecs?: VehicleTechSpecs;
  features?: VehicleFeatures;

  // Media & Location
  images: string[];
  location: VehicleLocation;

  tramer: number;
  insuranceExpiry?: string;
  kaskoExpiry?: string;
  description: string; // HTML content
  expertise?: ExpertiseReport;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  lastPurchaseDate?: string;
  purchasedVehicleId?: string;
  notes?: string;
}

export interface AiLog {
  id: string;
  customerName: string;
  platform: 'WhatsApp' | 'Web';
  query: string;
  response: string;
  timestamp: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
}

export interface DashboardStats {
  totalRevenue: number;
  netProfit: number;
  activeListings: number;
  totalCustomers: number;
  pendingInquiries: number;
}
