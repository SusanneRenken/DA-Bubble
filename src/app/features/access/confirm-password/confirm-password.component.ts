import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ComponentSwitcherService } from '../../../shared/services/component-switcher.service';
import { ButtonComponent } from '../../general-components/button/button.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthentificationService } from '../../../shared/services/authentification.service';

@Component({
  selector: 'app-confirm-password',
  imports: [ButtonComponent, ReactiveFormsModule],
  templateUrl: './confirm-password.component.html',
  styleUrl: './confirm-password.component.scss',
})
export class ConfirmPasswordComponent implements OnInit {
  newPassword!: FormGroup;
  oobCode: string | null = null;

  constructor(
    public componentSwitcher: ComponentSwitcherService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthentificationService
  ) {}

  ngOnInit(): void {
    this.oobCode = this.route.snapshot.queryParamMap.get('oobCode');
    this.newPassword = new FormGroup({
      newPassword: new FormControl('', Validators.required),
      conPassword: new FormControl('', Validators.required),
    });
  }

  onSubmit() {
    if (!this.oobCode) {
      console.error('Kein gültiger oobCode gefunden.');
      return;
    }
    const { newPassword, conPassword } = this.newPassword.value;
    if (newPassword === conPassword) {
      this.authService
        .confirmResetPassword(this.oobCode, newPassword)
        .then(() => {
          console.log('Password is confirmed: ', this.newPassword.value);
          this.changeComponent('login');
        })
        .catch((error) => {
          console.error('Error when resetting the password:', error);
        }
      );
    }
  }

  changeComponent(componentName: string) {
    this.componentSwitcher.setComponent(componentName);
  }
}
