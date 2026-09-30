export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrls?: string[];
}