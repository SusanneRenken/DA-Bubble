import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../general-components/button/button.component';
import { ComponentSwitcherService } from '../../../shared/services/component-switcher.service';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ButtonComponent, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fB = inject(FormBuilder);

  loginData = this.fB.group ({
    email: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(public componentSwitcher: ComponentSwitcherService) {}

  onSubmit() {
    if (this.loginData.valid) {
      console.log('Login-Data: ', this.loginData.value);
      this.changeComponent('avatar');
    }
  }

  changeComponent(componentName: string) {
    this.componentSwitcher.setComponent(componentName);
  }
}
