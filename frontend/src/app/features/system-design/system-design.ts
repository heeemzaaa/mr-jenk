import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ConfirmationModal } from '../../shared/components/confirmation-modal/confirmation-modal';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-system-design',
  standalone: true,
  imports: [CommonModule, LoadingSpinner, EmptyState, ConfirmationModal],
  templateUrl: './system-design.html',
})
export class SystemDesign {
  colors = [
    { name: '--color-bg', hex: '#fafaf9' },
    { name: '--color-text', hex: '#1a1a18' },
    { name: '--color-accent', hex: '#0f6e56' },
    { name: '--color-accent-hover', hex: '#085041' },
    { name: '--color-border', hex: '#e5e3de' },
  ];

  readonly toastService = inject(ToastService);
  showConfirmationModal = signal(false);
}
