import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ButtonComponent } from '../../general-components/button/button.component';
import { ComponentSwitcherService } from '../../../shared/services/component-switcher.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthentificationService } from '../../../shared/services/authentification.service';
import { Router } from '@angular/router';
import { CustomInputComponent } from '../../general-components/custom-input/custom-input.component';
import { SuccessIndicatorComponent } from '../../general-components/success-indicator/success-indicator.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ButtonComponent, ReactiveFormsModule, CustomInputComponent, SuccessIndicatorComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  authError: string = '';
  isConfirmationVisible: boolean = false;
  private sub?: Subscription;

  constructor(
    public componentSwitcher: ComponentSwitcherService,
    private authService: AuthentificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email, Validators.pattern('[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}')]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    });

    this.sub = this.loginForm.valueChanges.subscribe(() => {
      if (this.authError) this.authError = '';
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onSubmit(): void {
    if (!this.loginForm.valid) return;
  
    const { email, password } = this.loginForm.value;
    this.attemptLogin(email, password);
  }

  private attemptLogin(email: string, password: string): void {
    this.authService.loginWithEmail(email, password)
    .then(success => {
      if (success) this.showConfirmationAndNavigate();
    })
    .catch(error => this.handleLoginError(error));
  }
  
  private showConfirmationAndNavigate(): void {
    this.toggleConfirmation(true);
    setTimeout(() => this.toggleConfirmation(false), 2000);
  
    setTimeout(() => {
      const uid = this.authService.currentUid;
      this.router.navigate(['/home', uid]);
    }, 3000);
  }
  
  private toggleConfirmation(visible: boolean): void {
    this.isConfirmationVisible = visible;
  }
  
  private handleLoginError(error: any): void {
    console.error('Login error:', error);
    this.authError = this.mapErrorToMessage(error.code);
  }
  
  private mapErrorToMessage(code: string): string {
    switch (code) {
      case 'auth/invalid-credential':
        return 'E-Mail oder Passwort ist nicht korrekt.';
      default:
        return 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.';
    }
  }

  onLoginWithGoogle(): void {
    this.authService.loginWithGoogle()
    .then(result => {
      if (result) {
        const uid = this.authService.currentUid;
        this.router.navigate(['/home', uid]);
      }
    })
    .catch(error => console.error('Error during Google login:', error));
  }

  onLoginAsGuest(): void {
    this.authService.loginAsGuest()
    .then(result => {
      if (result) {
        const uid = this.authService.currentUid;
        this.router.navigate(['/home', uid]);
      }
    })
    .catch(error => console.error('Guest login error:', error));
  }

  changeComponent(componentName: string): void {
    this.componentSwitcher.setComponent(componentName);
  }
}
