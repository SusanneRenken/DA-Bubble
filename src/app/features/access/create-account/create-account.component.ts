import { Component, inject, OnInit } from '@angular/core';
import { ButtonComponent } from '../../general-components/button/button.component';
import { ComponentSwitcherService } from '../../../shared/services/component-switcher.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthentificationService } from '../../../shared/services/authentification.service';

@Component({
  selector: 'app-create-account',
  imports: [ButtonComponent, ReactiveFormsModule],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss',
})
export class CreateAccountComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(
    public componentSwitcher: ComponentSwitcherService,
    private authService: AuthentificationService
  ) {}

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      regName: new FormControl('', Validators.required),
      regEmail: new FormControl('', [Validators.required, Validators.email]),
      regPassword: new FormControl('', Validators.required),
      acceptPrivacy: new FormControl(false, Validators.requiredTrue),
    });
  }

  onSubmit() {
    const { regEmail, regPassword, regName } = this.registerForm.value;
    console.log('Create-Data: ', this.registerForm.value);
    this.authService.registerWithEmail(regEmail, regPassword, regName)
      .then(() => {
        console.log('Registration successful');
      })
      .catch((error) => {
        console.error('Error during registration', error);
      });
    if (this.registerForm.valid) {
      this.changeComponent('avatar');
    }
  }

  changeComponent(componentName: string) {
    this.componentSwitcher.setComponent(componentName);
  }
}
