import { Component, inject, OnInit } from '@angular/core';
import { MessageService } from '../../../shared/services/message.service';

@Component({
  selector: 'app-message-area',
  templateUrl: './message-area.component.html',
  styleUrls: ['./message-area.component.scss'],
})
export class MessageAreaComponent implements OnInit {
  private messageService = inject(MessageService);

  setMessageType: 'private' | 'channel' | 'thread' | 'new' = 'private';
  setMessageId: string = 'sEg8GcSNNZ6YWhxRs4SE';

  ngOnInit(): void {
    console.log('Hallo');
  }

  testMessage(): void {    
    console.log('Hallo Sofia', this.messageService.messages);
  }
}
