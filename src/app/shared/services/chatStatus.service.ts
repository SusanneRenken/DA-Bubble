import { Injectable, signal } from '@angular/core';
import { ChatState } from '../interfaces/chatStatus.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatStatusService {
  chatState = signal<ChatState | null>(null);

  setChatState(state: ChatState) {
    this.chatState.set(state);
  }
}