import { Component } from '@angular/core';
import { ButtonComponent } from '../../general-components/button/button.component';
import { ComponentSwitcherService } from '../../../shared/services/component-switcher.service';

@Component({
  selector: 'app-login',
  imports: [ButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  constructor(public componentSwitcher: ComponentSwitcherService) {}

  changeComponent(componentName: string) {
    this.componentSwitcher.setComponent(componentName);
  }
}
