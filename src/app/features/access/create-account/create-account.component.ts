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
import { CustomInputComponent } from '../../general-components/custom-input/custom-input.component';

@Component({
  selector: 'app-create-account',
  imports: [ButtonComponent, ReactiveFormsModule, CustomInputComponent],
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss', './create-account-checkbox.component.scss'],
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
      regPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      acceptPrivacy: new FormControl(false, Validators.requiredTrue),
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { regEmail, regPassword, regName } = this.registerForm.value;
      this.authService.registerWithEmail(regEmail, regPassword, regName)
      .then(() => {
        console.log('Registration successful');
        console.log('Create-Data: ', this.registerForm.value);
        this.changeComponent('avatar');
      })
      .catch((error) => {
        console.error('Error during registration', error);
      });
    }
  }

  changeComponent(componentName: string) {
    this.componentSwitcher.setComponent(componentName);
  }
}
