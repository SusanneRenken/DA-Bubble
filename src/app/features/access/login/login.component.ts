import { Component, inject, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-login',
  imports: [CommonModule, ButtonComponent, ReactiveFormsModule, CustomInputComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  authError: string = '';

  constructor(
    public componentSwitcher: ComponentSwitcherService,
    private authService: AuthentificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email, Validators.pattern('[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}')]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.loginWithEmail(email, password)
      .then(result => {
        if (result) {
          console.log('Login-Data: ', this.loginForm.value);
          const uid = this.authService.currentUid;
          this.router.navigate(['/home', uid]);
        }
      })
      .catch(error => {
        console.error('Login error:', error);
        switch(error.code) {
          case 'auth/invalid-credential':
            this.authError = 'E-Mail oder Passwort ist nicht korrekt.';
            break;
          default:
            this.authError = 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.';
            break;
        }
      });
    }
  }

  onLoginWithGoogle() {
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

  changeComponent(componentName: string) {
    this.componentSwitcher.setComponent(componentName);
  }
}
