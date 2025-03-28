import { Component } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { NgComponentOutlet } from '@angular/common';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ComponentSwitcherService } from '../../shared/services/component-switcher.service';

@Component({
  selector: 'app-access',
  imports: [NgComponentOutlet],
  templateUrl: './access.component.html',
  styleUrl: './access.component.scss'
})
export class AccessComponent {

  constructor(public componentSwitcher: ComponentSwitcherService) {}

  changeComponent(componentName: string) {
    this.componentSwitcher.setComponent(componentName);
  }
}
