import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { ContactBarComponent } from './contact-bar/contact-bar.component';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ContactBarComponent],
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss']  
})
export class MainContentComponent {

}
