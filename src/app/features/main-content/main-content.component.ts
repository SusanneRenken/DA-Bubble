import { Component } from '@angular/core';
import { ContactBarComponent } from './contact-bar/contact-bar.component';
import { HeaderComponent } from './header/header.component';
import { MessageAreaComponent } from './message-area/message-area.component';

@Component({
  selector: 'app-main-content',
  imports: [ContactBarComponent, HeaderComponent, MessageAreaComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent {

}
