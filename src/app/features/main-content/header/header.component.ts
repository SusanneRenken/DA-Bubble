import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { UserNameComponent } from './user-name/user-name.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, UserNameComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

}
