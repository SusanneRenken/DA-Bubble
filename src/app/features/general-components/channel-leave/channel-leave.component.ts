import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Channel } from '../../../shared/interfaces/channel.interface';

@Component({
  selector: 'app-channel-leave',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './channel-leave.component.html',
  styleUrl: './channel-leave.component.scss',
})
export class ChannelLeaveComponent {
  @Input() channelData: Channel | null = null;
  @Output() close = new EventEmitter<void>();

  closeWindow() {
    this.close.emit();
  }

}
