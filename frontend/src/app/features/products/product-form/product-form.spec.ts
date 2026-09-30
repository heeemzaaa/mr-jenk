import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductForm } from './product-form';
import { Product } from '../../../shared/models/product.model';

const mockProduct: Product = {
  id: '1212',
  name: 'chair',
  description: 'A sturdy wooden chair.',
  price: 21,
  quantity: 20,
};

const setInputValue = (fixture: ComponentFixture<ProductForm>, selector: string, value: string) => {
  const el: HTMLInputElement = fixture.nativeElement.querySelector(selector);
  el.value = value;
  el.dispatchEvent(new Event('input'));
};

describe('ProductForm', () => {
  let fixture: ComponentFixture<ProductForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductForm],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductForm);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should start with an empty form', () => {
    expect(fixture.componentInstance.productForm().value()).toEqual({
      name: '',
      description: '',
      price: 0,
      quantity: 0,
    });
  });

  it('should not emit save when the form is invalid', async () => {
    const saveSpy = vi.fn();
    fixture.componentInstance.save.subscribe(saveSpy);

    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();

    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('should show a validation error for price <= 0 once touched', () => {
    const priceInput: HTMLInputElement = fixture.nativeElement.querySelector('#pfPrice');
    priceInput.value = '0';
    priceInput.dispatchEvent(new Event('input'));
    priceInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Price must be greater than 0.');
  });

  it('should NOT show a validation error for a quantity of 0 (out of stock is valid)', () => {
    const quantityInput: HTMLInputElement = fixture.nativeElement.querySelector('#pfQuantity');
    quantityInput.value = '0';
    quantityInput.dispatchEvent(new Event('input'));
    quantityInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Quantity cannot be negative.');
  });

  it('should show a validation error for a negative quantity once touched', () => {
    const quantityInput: HTMLInputElement = fixture.nativeElement.querySelector('#pfQuantity');
    quantityInput.value = '-1';
    quantityInput.dispatchEvent(new Event('input'));
    quantityInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Quantity cannot be negative.');
  });

  it('should show a validation error when price exceeds 999,999.99', () => {
    const priceInput: HTMLInputElement = fixture.nativeElement.querySelector('#pfPrice');
    priceInput.value = '1000000';
    priceInput.dispatchEvent(new Event('input'));
    priceInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Price must be at most 999,999.99.');
  });

  it('should show a validation error when quantity exceeds 999,999', () => {
    const quantityInput: HTMLInputElement = fixture.nativeElement.querySelector('#pfQuantity');
    quantityInput.value = '1000000';
    quantityInput.dispatchEvent(new Event('input'));
    quantityInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Quantity must be at most 999,999.');
  });

  it('should emit save with the form value when valid', async () => {
    const saveSpy = vi.fn();
    fixture.componentInstance.save.subscribe(saveSpy);

    setInputValue(fixture, '#pfName', 'table');
    setInputValue(fixture, '#pfDescription', 'A wooden table.');
    setInputValue(fixture, '#pfPrice', '50');
    setInputValue(fixture, '#pfQuantity', '10');
    fixture.detectChanges();

    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();

    expect(saveSpy).toHaveBeenCalledWith({
      name: 'table',
      description: 'A wooden table.',
      price: 50,
      quantity: 10,
    });
  });

  it('should patch the form from editingProduct when focusTrigger changes', () => {
    fixture.componentRef.setInput('editingProduct', mockProduct);
    fixture.componentRef.setInput('focusTrigger', 1);
    fixture.detectChanges();

    expect(fixture.componentInstance.productForm().value()).toEqual({
      name: 'chair',
      description: 'A sturdy wooden chair.',
      price: 21,
      quantity: 20,
    });
  });

  it('should reset to an empty form when focusTrigger changes with no editingProduct', () => {
    fixture.componentRef.setInput('editingProduct', mockProduct);
    fixture.componentRef.setInput('focusTrigger', 1);
    fixture.detectChanges();

    fixture.componentRef.setInput('editingProduct', null);
    fixture.componentRef.setInput('focusTrigger', 2);
    fixture.detectChanges();

    expect(fixture.componentInstance.productForm().value()).toEqual({
      name: '',
      description: '',
      price: 0,
      quantity: 0,
    });
  });
});
