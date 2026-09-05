export interface ICreateGear {
  name: string;
  description: string;
  brand: string;
  pricePerDay: number;
  stock?: number;
  isAvailable?: boolean;
  specifications?: any;
  categoryId: string;
}