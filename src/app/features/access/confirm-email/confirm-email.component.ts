import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-email',
  imports: [ButtonComponent, ReactiveFormsModule, CustomInputComponent, SuccessIndicatorComponent],
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.scss',
})
export class ConfirmEmailComponent implements OnInit, OnDestroy {
  confirmForm!: FormGroup;
  findEmail: string = '';
  isConfirmationVisible: boolean = false;
  private sub?: Subscription;

  constructor(
    public componentSwitcher: ComponentSwitcherService,
    private authService: AuthentificationService
  ) {}

  ngOnInit(): void {
    this.confirmForm = new FormGroup({
      conEmail: new FormControl('', [Validators.required, Validators.email]),
    });

    this.sub = this.confirmForm.valueChanges.subscribe(() => {
      if (this.findEmail) {
        this.findEmail = '';
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onSubmit(): void {
    if (!this.confirmForm.valid) return;  
    const email = this.confirmForm.value.conEmail;
    this.sendResetEmail(email);
  }

  private sendResetEmail(email: string): void {
    this.authService.sendResetPasswordEmail(email)
    .then(() => this.handleSendSuccess())
    .catch(error => this.handleSendError(error));
  }
  
  private handleSendSuccess(): void {
    this.toggleConfirmation(true);
    setTimeout(() => this.toggleConfirmation(false), 2000);
    setTimeout(() => this.changeComponent('goToEmail'), 3000);
  }
  
  private toggleConfirmation(visible: boolean): void {
    this.isConfirmationVisible = visible;
  }
  
  private handleSendError(error: any): void {
    console.error('Error when sending the reset email:', error);
    this.findEmail = 'Es wurde keine übereinstimmende E-Mail gefunden.';
  }

  changeComponent(componentName: string): void {
    this.componentSwitcher.setComponent(componentName);
  }
}
