import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-member-add-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-add-channel.component.html',
  styleUrl: './member-add-channel.component.scss'
})
export class MemberAddChannelComponent {
  selectedOption: string = '';
}
