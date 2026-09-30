import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  templateUrl: './confirmation-modal.html',
})
export class ConfirmationModal {
  title = input.required<string>();
  message = input.required<string>();
  confirmLabel = input('Confirm');
  cancelLabel = input('Cancel');

  confirmed = output<void>();
  cancelled = output<void>();
}