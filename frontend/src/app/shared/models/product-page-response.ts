import { Product } from './product.model'; 

export interface ProductPageResponse {
  items: Product[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}