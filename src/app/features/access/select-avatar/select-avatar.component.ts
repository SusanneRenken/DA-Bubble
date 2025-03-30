import { Component } from '@angular/core';
import { ButtonComponent } from '../../general-components/button/button.component';
import { ComponentSwitcherService } from '../../../shared/services/component-switcher.service';

@Component({
  selector: 'app-select-avatar',
  imports: [ButtonComponent],
  templateUrl: './select-avatar.component.html',
  styleUrl: './select-avatar.component.scss'
})
export class SelectAvatarComponent {
  constructor(public componentSwitcher: ComponentSwitcherService) {}

  changeComponent(componentName: string) {
    this.componentSwitcher.setComponent(componentName);
  }
}
