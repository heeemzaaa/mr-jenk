import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyState } from './empty-state'; 

describe('EmptyState', () => {
  let fixture: ComponentFixture<EmptyState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyState],
    }).compileComponents();
    fixture = TestBed.createComponent(EmptyState);
    fixture.componentRef.setInput('message', 'No products yet.');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the message', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No products yet.');
  });

  it('should not render an action button when actionLabel is not provided', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('should render an action button and emit on click when actionLabel is provided', () => {
    fixture.componentRef.setInput('actionLabel', 'Create New Product');
    fixture.detectChanges();

    const emitSpy = vi.fn();
    fixture.componentInstance.action.subscribe(emitSpy);

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.textContent.trim()).toBe('Create New Product');

    button.click();
    expect(emitSpy).toHaveBeenCalledOnce();
  });
});