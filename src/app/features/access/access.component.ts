import { Component } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
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
