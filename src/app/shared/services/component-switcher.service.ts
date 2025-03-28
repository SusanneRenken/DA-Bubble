import { Injectable, signal } from '@angular/core';
import { LoginComponent } from '../../features/access/login/login.component';
import { CreateAccountComponent } from '../../features/access/create-account/create-account.component';
import { ImprintComponent } from '../../features/access/imprint/imprint.component';
import { PrivacyComponent } from '../../features/access/privacy/privacy.component';
import { SelectAvatarComponent } from '../../features/access/select-avatar/select-avatar.component';

@Injectable({
  providedIn: 'root'
})
export class ComponentSwitcherService {
  currentComponent = signal<any>(LoginComponent);

  constructor() {}

  setComponent(componentName: string): void {
    switch(componentName) {
      case 'login':
        this.currentComponent.set(LoginComponent);
        break;
      case 'signin':
        this.currentComponent.set(CreateAccountComponent);
        break;
      case 'imprit':
        this.currentComponent.set(ImprintComponent);
        break;
      case 'privacy':
        this.currentComponent.set(PrivacyComponent);
        break;
      case 'avatar':
        this.currentComponent.set(SelectAvatarComponent);
        break;
      default:
        this.currentComponent.set(LoginComponent);
    }
  }
}
