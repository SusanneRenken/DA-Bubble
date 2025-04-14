import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DeviceVisibleComponent } from '../../../../shared/services/responsive';

@Component({
  selector: 'app-header-bar',
  standalone: true,
  imports: [CommonModule, DeviceVisibleComponent],
  templateUrl: './header-bar.component.html',
  styleUrl: './header-bar.component.scss'
})
export class HeaderBarComponent {

}
