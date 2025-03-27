import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  template: `<button>{{ text }}</button>`,
  styles: [`
      button {
        padding: 12px 25px;
        border-radius: 25px;
      }
    `,
  ],
})
export class ButtonComponent {
  @Input() text?: string;
}
