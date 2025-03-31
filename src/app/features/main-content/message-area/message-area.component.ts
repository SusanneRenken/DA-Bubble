import { Component, inject, OnInit } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Message } from '../../../shared/interfaces/message.interface';
import { MessageService } from '../../../shared/services/message.service';
import { ChatState } from '../../../shared/interfaces/chatStatus.interface';
import { ChatStatusService } from '../../../shared/services/chatStatus.service';

@Component({
  selector: 'app-message-area',
  templateUrl: './message-area.component.html',
  styleUrls: ['./message-area.component.scss']
})
export class MessageAreaComponent implements OnInit {
  private messageService = inject(MessageService);
  private chatStatusService = inject(ChatStatusService);

  messages$: Observable<Message[]> = of([]);

  ngOnInit(): void {
    // Zum Testen: Setze einen ChatState
    this.chatStatusService.setChatState({
      type: 'private',
      id: 'sEg8GcSNNZ6YWhxRs4SE'
    });

    this.messages$ = this.chatStatusService.chatState$.pipe(
      switchMap((state: ChatState | null) => {
        if (!state) {
          return this.messageService.getMessageCollection();
        }
        switch (state.type) {
          case 'private':
            return this.messageService.getDirectMessages(
              state.id,
              'Eg2jVLodTA9FI99IMJUK'
            );
          case 'channel':
            return this.messageService.getChannelMessages(state.id);
          case 'thread':
            return this.messageService.getThreadMessages(state.id);
          default:
            return this.messageService.getMessageCollection();
        }
      })
    );
  }

  testMessage(): void {
    this.messages$.subscribe((messages) => {
      console.log('Direct Messages:', messages);
    });
  }
}
