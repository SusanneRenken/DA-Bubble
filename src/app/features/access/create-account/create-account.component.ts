import { Component } from '@angular/core';
import { ButtonComponent } from '../../general-components/button/button.component';
import { ComponentSwitcherService } from '../../../shared/services/component-switcher.service';

@Component({
  selector: 'app-create-account',
  imports: [ButtonComponent],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss'
})
export class CreateAccountComponent {

  constructor(public componentSwitcher: ComponentSwitcherService) {}
  
    changeComponent(componentName: string) {
      this.componentSwitcher.setComponent(componentName);
    }
}
