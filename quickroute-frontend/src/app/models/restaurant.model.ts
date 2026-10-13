export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  imageUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  products: Product[];
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  cuisine?: string;
  imageUrl?: string;
  status: 'OPEN' | 'CLOSED' | 'UNAVAILABLE';
  categories?: Category[];
}
