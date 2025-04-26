import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ComponentSwitcherService } from '../../../shared/services/component-switcher.service';
import { ButtonComponent } from '../../general-components/button/button.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthentificationService } from '../../../shared/services/authentification.service';
import { CustomInputComponent } from '../../general-components/custom-input/custom-input.component';
import { SuccessIndicatorComponent } from '../../general-components/success-indicator/success-indicator.component';

@Component({
  selector: 'app-confirm-password',
  imports: [
    ButtonComponent,
    ReactiveFormsModule,
    CustomInputComponent,
    SuccessIndicatorComponent,
  ],
  templateUrl: './confirm-password.component.html',
  styleUrl: './confirm-password.component.scss',
})
export class ConfirmPasswordComponent implements OnInit {
  newPassword!: FormGroup;
  oobCode: string | null = null;
  isConfirmationVisible: boolean = false;

  static passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const newPassword = group.get('newPassword')?.value;
    const conPassword = group.get('conPassword')?.value;
    return newPassword === conPassword ? null : { passwordMismatch: true };
  };

  constructor(
    public componentSwitcher: ComponentSwitcherService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthentificationService
  ) {}

  ngOnInit(): void {
    this.oobCode = this.route.snapshot.queryParamMap.get('oobCode');
    this.newPassword = new FormGroup({
      newPassword: new FormControl('', [Validators.required, Validators.minLength(8),]),
      conPassword: new FormControl('', [Validators.required, Validators.minLength(8),]),
    },
    { validators: ConfirmPasswordComponent.passwordMatchValidator }
    );
  }

  isPasswordMismatch(): boolean {
    return (!!this.newPassword.errors && this.newPassword.errors['passwordMismatch']);
  }

  onSubmit() {
    if (this.newPassword.valid) {
      if (!this.oobCode) {
        console.error('Kein gültiger oobCode gefunden.');
        return;
      }
      const { newPassword, conPassword } = this.newPassword.value;
      if (newPassword === conPassword) {
        this.authService
          .confirmResetPassword(this.oobCode, newPassword)
          .then(() => {
            this.isConfirmationVisible = true;
            setTimeout(() => this.isConfirmationVisible = false, 2000);
            setTimeout(() => {
              this.router.navigate(['/access']);
              this.changeComponent('login');
            }, 3000);
          })
          .catch((error) => {
            console.error('Error when resetting the password:', error);
          });
      }
    }
  }

  goBackToEmailConfirm() {
    this.router.navigate(['/access']);
    this.changeComponent('conMail');
  }

  changeComponent(componentName: string) {
    this.componentSwitcher.setComponent(componentName);
  }
}
