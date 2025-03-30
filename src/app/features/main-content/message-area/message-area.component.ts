import { Component, effect, inject, OnInit } from '@angular/core';
import { Observable, of, switchMap, take } from 'rxjs';
import { Message } from '../../../shared/interfaces/message.interface';
import { MessageService } from '../../../shared/services/message.service';
import { ChatState } from '../../../shared/interfaces/chatStatus.interface';
import { ChatStatusService } from '../../../shared/services/chatStatus.service';

@Component({
  selector: 'app-message-area',
  imports: [],
  templateUrl: './message-area.component.html',
  styleUrl: './message-area.component.scss',
})
export class MessageAreaComponent {
  private messageService = inject(MessageService);
  private chatStatusService = inject(ChatStatusService);

  messages$: Observable<Message[]> = of([]);

  ngOnInit(): void {
    //Zum Testen der Chat-Status-Änderung - muss später entfernt werden
    this.chatStatusService.setChatState({
      type: 'private',
      id: 'sEg8GcSNNZ6YWhxRs4SE',
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
    console.log(this.messages$);
  }
}
