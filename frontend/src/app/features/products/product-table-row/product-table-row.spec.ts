import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTableRow } from './product-table-row';
import { Product } from '../../../shared/models/product.model';

const mockProduct: Product = {
  id: '1212',
  name: 'chair',
  description: 'A sturdy wooden chair.',
  price: 21,
  quantity: 20,
};

describe('ProductTableRow', () => {
  let fixture: ComponentFixture<ProductTableRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductTableRow],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductTableRow);
    fixture.componentRef.setInput('product', mockProduct);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the product fields', () => {
    fixture.detectChanges();
    const cells: HTMLElement[] = fixture.nativeElement.querySelectorAll('td');
    expect(cells[0].textContent.trim()).toBe('1212');
    expect(cells[1].textContent.trim()).toBe('chair');
    expect(cells[2].textContent.trim()).toBe('21 DH');
    expect(cells[3].textContent.trim()).toBe('20');
  });

  it('should emit edit with the product when the edit button is clicked', () => {
    fixture.detectChanges();
    const editSpy = vi.fn();
    fixture.componentInstance.edit.subscribe(editSpy);

    const [editButton] = fixture.nativeElement.querySelectorAll('button');
    editButton.click();

    expect(editSpy).toHaveBeenCalledWith(mockProduct);
  });

  it('should emit delete with the product when the delete button is clicked', () => {
    fixture.detectChanges();
    const deleteSpy = vi.fn();
    fixture.componentInstance.delete.subscribe(deleteSpy);

    const [, deleteButton] = fixture.nativeElement.querySelectorAll('button');
    deleteButton.click();

    expect(deleteSpy).toHaveBeenCalledWith(mockProduct);
  });
});