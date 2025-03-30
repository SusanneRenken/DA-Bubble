import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComponentSwitcherService } from '../../../shared/services/component-switcher.service';
import { ButtonComponent } from '../../general-components/button/button.component';

@Component({
  selector: 'app-confirm-password',
  imports: [ButtonComponent, ReactiveFormsModule],
  templateUrl: './confirm-password.component.html',
  styleUrl: './confirm-password.component.scss'
})
export class ConfirmPasswordComponent {
  private fB = inject(FormBuilder);

  confirmedPassword = this.fB.group({
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required]
  });

  constructor(public componentSwitcher: ComponentSwitcherService) {}

  onSubmit() {
    if (this.confirmedPassword.valid) {
      console.log('Password ist confirmed: ', this.confirmedPassword.value);
      this.changeComponent('login');
    }
  }

  changeComponent(componentName: string) {
    this.componentSwitcher.setComponent(componentName);
  }
}
