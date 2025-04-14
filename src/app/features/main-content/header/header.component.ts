import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { UserNameComponent } from './user-name/user-name.component';
import { DeviceVisibleComponent } from '../../../shared/services/responsive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    SearchBarComponent,
    UserNameComponent,
    DeviceVisibleComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Input() activeUserId!: string | null;
  @Input() messageIn!: boolean;
  @Output() messageInToggle = new EventEmitter<boolean>();

  toggleMessageInView() {
    this.messageInToggle.emit(false);
  }
}
