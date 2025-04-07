import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-channel-leave',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channel-leave.component.html',
  styleUrl: './channel-leave.component.scss',
})
export class ChannelLeaveComponent {
  @Output() close = new EventEmitter<void>();

  closeWindow() {
    this.close.emit();
  }
}
