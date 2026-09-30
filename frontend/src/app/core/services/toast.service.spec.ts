import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast.service'; 

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start with an empty queue', () => {
    expect(service.toasts()).toEqual([]);
  });

  it('should push a success toast', () => {
    service.success('Product created.');
    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0]).toMatchObject({ variant: 'success', message: 'Product created.' });
  });

  it('should push an error toast', () => {
    service.error('Something went wrong.');
    expect(service.toasts()[0]).toMatchObject({ variant: 'error', message: 'Something went wrong.' });
  });

  it('should push an info toast', () => {
    service.info('Just so you know…');
    expect(service.toasts()[0]).toMatchObject({ variant: 'info', message: 'Just so you know…' });
  });

  it('should assign each toast a unique, incrementing id', () => {
    service.success('First');
    service.success('Second');
    const [first, second] = service.toasts();
    expect(second.id).not.toBe(first.id);
  });

  it('should dismiss a toast by id', () => {
    service.success('Dismiss me');
    const id = service.toasts()[0].id;

    service.dismiss(id);
    expect(service.toasts()).toEqual([]);
  });

  it('should auto-dismiss a success toast after its default duration', () => {
    service.success('Auto-dismiss');
    expect(service.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(4000);
    expect(service.toasts()).toEqual([]);
  });

  it('should auto-dismiss an error toast after its (longer) default duration', () => {
    service.error('Auto-dismiss error');

    vi.advanceTimersByTime(4000);
    expect(service.toasts()).toHaveLength(1); // still there — error uses 6000ms

    vi.advanceTimersByTime(2000);
    expect(service.toasts()).toEqual([]);
  });

  it('should respect a custom duration', () => {
    service.info('Custom duration', 1000);

    vi.advanceTimersByTime(999);
    expect(service.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(service.toasts()).toEqual([]);
  });
});