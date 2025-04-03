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

@Component({
  selector: 'app-confirm-email',
  imports: [ButtonComponent, ReactiveFormsModule],
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.scss',
})
export class ConfirmEmailComponent implements OnInit {
  confirmForm!: FormGroup;

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
    const email = this.confirmForm.value.conEmail;
    this.authService.sendResetPasswordEmail(email)
      .then(() => {
        console.log('Mail is confirmed: ', this.confirmForm.value);
        this.changeComponent('conPassword');
      })
      .catch(error => {
        console.error('Fehler beim Versenden der Reset-Email:', error);
      }
    );
  }

  changeComponent(componentName: string) {
    this.componentSwitcher.setComponent(componentName);
  }
}
