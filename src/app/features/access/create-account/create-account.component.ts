import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../general-components/button/button.component';
import { ComponentSwitcherService } from '../../../shared/services/component-switcher.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-account',
  imports: [ButtonComponent, ReactiveFormsModule],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss',
})
export class CreateAccountComponent {
  private fB = inject(FormBuilder);

  createData = this.fB.group({
    name: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
    acceptPrivacy: [false, Validators.requiredTrue]
  });

  constructor(public componentSwitcher: ComponentSwitcherService) {}

  onSubmit() {
    if (this.createData.valid) {
      console.log('Create-Data: ', this.createData.value);
      this.changeComponent('avatar');
    }
  }

  changeComponent(componentName: string) {
    this.componentSwitcher.setComponent(componentName);
  }
}
