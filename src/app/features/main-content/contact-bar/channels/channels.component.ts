import { CommonModule } from '@angular/common';
import { AddChannelComponent } from './add-channel/add-channel.component';
import { inject, Component, Input, EventEmitter, Output} from '@angular/core';
import { Firestore} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-channels',
  standalone: true,
  imports: [CommonModule, AddChannelComponent],
  templateUrl: './channels.component.html',
  styleUrl: './channels.component.scss'
})

export class ChannelsComponent{
  showAddChannel = false;
  showChannels = false;
  channels$: Observable<any[]> = of([]); 
  @Input() activeUserId!: string | null;
  @Output() openChat = new EventEmitter<{ chatType: 'private' | 'channel'; chatId: string }>();
  @Output() toggleMessage = new EventEmitter<boolean>();


  constructor(private channelService: ChannelService) {}

  ngOnInit() {
    this.loadChannels();
  }

  someAction() {
    const screenWidth = window.innerWidth;
    if (screenWidth < 1000) {
      this.toggleMessage.emit(true);
    }
  }
  
  
  loadChannels() {
    this.channels$ = this.channelService.getSortedChannels();
  }
  
  
  toggleAddChannel() {
    this.showAddChannel = !this.showAddChannel;
  }


  showAllChannels(){
    this.showChannels = !this.showChannels
  }


  selectChannel(channelId: string): void {
    this.openChat.emit({
      chatType: 'channel',
      chatId: channelId
    });
  }
}import { ChannelService } from '../../../../shared/services/channel.service';

