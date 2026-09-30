import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationModal } from './confirmation-modal'; 

describe('ConfirmationModal', () => {
  let fixture: ComponentFixture<ConfirmationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationModal],
    }).compileComponents();
    fixture = TestBed.createComponent(ConfirmationModal);
    fixture.componentRef.setInput('title', 'Delete product?');
    fixture.componentRef.setInput('message', "This can't be undone.");
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the title and message', () => {
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Delete product?');
    expect(text).toContain("This can't be undone.");
  });

  it('should default confirmLabel and cancelLabel', () => {
    fixture.detectChanges();
    const buttons: HTMLButtonElement[] = fixture.nativeElement.querySelectorAll('.modal-footer button');
    expect(buttons[0].textContent.trim()).toBe('Cancel');
    expect(buttons[1].textContent.trim()).toBe('Confirm');
  });

  it('should emit cancelled when the cancel button is clicked', () => {
    fixture.detectChanges();
    const cancelledSpy = vi.fn();
    fixture.componentInstance.cancelled.subscribe(cancelledSpy);

    fixture.nativeElement.querySelector('.btn-outline-primary').click();
    expect(cancelledSpy).toHaveBeenCalledOnce();
  });

  it('should emit confirmed when the confirm button is clicked', () => {
    fixture.detectChanges();
    const confirmedSpy = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmedSpy);

    fixture.nativeElement.querySelector('.btn-danger').click();
    expect(confirmedSpy).toHaveBeenCalledOnce();
  });

  it('should emit cancelled when the backdrop is clicked', () => {
    fixture.detectChanges();
    const cancelledSpy = vi.fn();
    fixture.componentInstance.cancelled.subscribe(cancelledSpy);

    fixture.nativeElement.querySelector('.modal-backdrop').click();
    expect(cancelledSpy).toHaveBeenCalledOnce();
  });
});