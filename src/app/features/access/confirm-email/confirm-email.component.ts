import { Component, inject, OnInit } from '@angular/core';
import { ButtonComponent } from '../../general-components/button/button.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ComponentSwitcherService } from '../../../shared/services/component-switcher.service';
import { AuthentificationService } from '../../../shared/services/authentification.service';
import { CustomInputComponent } from '../../general-components/custom-input/custom-input.component';
import { SuccessIndicatorComponent } from '../../general-components/success-indicator/success-indicator.component';

@Component({
  selector: 'app-confirm-email',
  imports: [ButtonComponent, ReactiveFormsModule, CustomInputComponent, SuccessIndicatorComponent],
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.scss',
})
export class ConfirmEmailComponent implements OnInit {
  confirmForm!: FormGroup;
  findEmail: string = '';
  isConfirmationVisible: boolean = false;

  constructor(
    public componentSwitcher: ComponentSwitcherService,
    private authService: AuthentificationService
  ) {}

  ngOnInit(): void {
    this.confirmForm = new FormGroup({
      conEmail: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  onSubmit() {
    if (this.confirmForm.valid) {
      const email = this.confirmForm.value.conEmail;
      this.authService.sendResetPasswordEmail(email)
      .then(() => {
        console.log('Mail is confirmed: ', this.confirmForm.value);
        this.isConfirmationVisible = true;
        setTimeout(() => {
          this.isConfirmationVisible = false;
        }, 2000);
        setTimeout(() => {
          this.changeComponent('goToEmail');
        }, 3000);
      })
      .catch(error => {
        console.error('Error when sending the reset email:', error);
        if (error) this.findEmail = 'Es wurde keine E-Mail gefunden. Bitte geben sie iher richtige E-Mail-Adresse ein.';
      });
    }
  }

  changeComponent(componentName: string) {
    this.componentSwitcher.setComponent(componentName);
  }
}
