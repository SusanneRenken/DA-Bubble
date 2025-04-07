import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  template: `
    <button [type]="type" [disabled]="disabled" (click)="handleClick()">
      <ng-content></ng-content>
    </button>
  `,
  styles: [
    `
      button {
        padding: 12px 25px;
        border-radius: 25px;
      }
    `,
  ],
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<void>();

  handleClick(): void {
    this.clicked.emit();
  }
}
