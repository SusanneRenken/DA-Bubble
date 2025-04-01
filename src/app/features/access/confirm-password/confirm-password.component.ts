import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComponentSwitcherService } from '../../../shared/services/component-switcher.service';
import { ButtonComponent } from '../../general-components/button/button.component';

@Component({
  selector: 'app-confirm-password',
  imports: [ButtonComponent, ReactiveFormsModule],
  templateUrl: './confirm-password.component.html',
  styleUrl: './confirm-password.component.scss'
})
export class ConfirmPasswordComponent implements OnInit {

  newPassword!: FormGroup;

  constructor(public componentSwitcher: ComponentSwitcherService) {}

  ngOnInit(): void {
    this.newPassword = new FormGroup({
      newPassword: new FormControl('', Validators.required),
      conPassword: new FormControl('', Validators.required)
    });
  }

  onSubmit() {
    const { newPassword, conPassword } = this.newPassword.value;
    if (newPassword === conPassword) {
      console.log('Password ist confirmed: ', this.newPassword.value);
      this.changeComponent('login');
    }
  }

  changeComponent(componentName: string) {
    this.componentSwitcher.setComponent(componentName);
  }
}
