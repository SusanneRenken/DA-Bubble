import { Component } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { NgComponentOutlet } from '@angular/common';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyComponent } from './privacy/privacy.component';

@Component({
  selector: 'app-access',
  imports: [NgComponentOutlet],
  templateUrl: './access.component.html',
  styleUrl: './access.component.scss'
})
export class AccessComponent {
  currentComponent = LoginComponent;

  setComponent(componentName: string): void {
    switch(componentName) {
      case 'login':
        this.currentComponent = LoginComponent;
        break;
      case 'signin':
        this.currentComponent = CreateAccountComponent;
        break;
      case 'imprit':
        this.currentComponent = ImprintComponent;
        break;
      case 'privacy':
        this.currentComponent = PrivacyComponent;
        break;
      default:
        this.currentComponent = LoginComponent;
    }
  }
}
