import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Product } from '../../../shared/models/product.model';

@Component({
  selector: 'tr[app-product-table-row]',
  standalone: true,
  templateUrl: './product-table-row.html',
})
export class ProductTableRow {
  @Input({ required: true }) product!: Product;
  @Output() edit = new EventEmitter<Product>();
  @Output() delete = new EventEmitter<Product>();
}
