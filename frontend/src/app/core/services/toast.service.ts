import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  variant: ToastVariant;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly toastsSignal = signal<Toast[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  success(message: string, durationMs = 4000): void {
    this.push('success', message, durationMs);
  }

  error(message: string, durationMs = 6000): void {
    this.push('error', message, durationMs);
  }

  info(message: string, durationMs = 4000): void {  
    this.push('info', message, durationMs);
  }

  dismiss(id: number): void {
    this.toastsSignal.update((list) => list.filter((t) => t.id !== id));
  }

  private push(variant: ToastVariant, message: string, durationMs: number): void {
    const id = this.nextId++;
    this.toastsSignal.update((list) => [...list, { id, variant, message }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }
}