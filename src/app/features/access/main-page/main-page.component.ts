import { Component } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { CreateAccountComponent } from '../create-account/create-account.component';

@Component({
  selector: 'app-main-page',
  imports: [LoginComponent, CreateAccountComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {
  isVisible: boolean = true;


  changeVisible() {
    this.isVisible = false;
  }
}
