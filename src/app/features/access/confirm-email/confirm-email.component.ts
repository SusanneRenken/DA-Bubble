import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../general-components/button/button.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComponentSwitcherService } from '../../../shared/services/component-switcher.service';

@Component({
  selector: 'app-confirm-email',
  imports: [ButtonComponent, ReactiveFormsModule],
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.scss'
})
export class ConfirmEmailComponent {
  private fB = inject(FormBuilder);

  confirmedMail = this.fB.group({
    email: ['', Validators.required]
  });

  constructor(public componentSwitcher: ComponentSwitcherService) {}

  onSubmit() {
    if (this.confirmedMail.valid) {
      console.log('Mail ist confirmed: ', this.confirmedMail.value);
      this.changeComponent('conPassword');
    }
  }

  changeComponent(componentName: string) {
    this.componentSwitcher.setComponent(componentName);
  }
}
