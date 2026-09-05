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

export interface IUpdateGear {
  name?: string;
  description?: string;
  brand?: string;
  pricePerDay?: number;
  stock?: number;
  isAvailable?: boolean;
  specifications?: Record<string, any>;
  categoryId?: string;
}

export interface IGearFilterRequest {
  searchTerm?: string;
  category?: string;
  brand?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: string | number;
  limit?: string | number;
}
