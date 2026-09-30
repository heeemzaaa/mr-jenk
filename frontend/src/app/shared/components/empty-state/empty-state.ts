import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.html',
})
export class EmptyState {
  message = input.required<string>();
  actionLabel = input<string | null>(null);
  action = output<void>();
}