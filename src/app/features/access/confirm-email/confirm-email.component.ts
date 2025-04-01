import { Component, inject, OnInit } from '@angular/core';
import { ButtonComponent } from '../../general-components/button/button.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComponentSwitcherService } from '../../../shared/services/component-switcher.service';

@Component({
  selector: 'app-confirm-email',
  imports: [ButtonComponent, ReactiveFormsModule],
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.scss'
})
export class ConfirmEmailComponent  implements OnInit {
  
  confirmForm!: FormGroup;
  

  constructor(public componentSwitcher: ComponentSwitcherService) {}

  ngOnInit(): void {
    this.confirmForm = new FormGroup({
      conEmail: new FormControl('', [Validators.required, Validators.email])
    });
  }

  onSubmit() {
    if (this.confirmForm.valid) {
      console.log('Mail ist confirmed: ', this.confirmForm.value);
      this.changeComponent('conPassword');
    }
  }

  changeComponent(componentName: string) {
    this.componentSwitcher.setComponent(componentName);
  }
}
