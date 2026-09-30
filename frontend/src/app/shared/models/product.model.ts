export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  userId?: string;
  imageUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
}