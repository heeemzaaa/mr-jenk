import { beforeEach, describe, expect, it } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastContainer } from './toast-container'; 
import { ToastService } from '../../../core/services/toast.service';

describe('ToastContainer', () => {
  let fixture: ComponentFixture<ToastContainer>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastContainer],
    }).compileComponents();
    fixture = TestBed.createComponent(ToastContainer);
    toastService = TestBed.inject(ToastService);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render nothing when the queue is empty', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.toast')).toHaveLength(0);
  });

  it('should render a toast pushed via ToastService', () => {
    toastService.success('Product created.');
    fixture.detectChanges();

    const toastEl: HTMLElement = fixture.nativeElement.querySelector('.toast');
    expect(toastEl.textContent).toContain('Product created.');
    expect(toastEl.classList.contains('text-bg-success')).toBe(true);
  });

  it('should remove a toast from the DOM when its close button is clicked', () => {
    toastService.success('Dismiss me');
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.btn-close').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.toast')).toHaveLength(0);
  });
});