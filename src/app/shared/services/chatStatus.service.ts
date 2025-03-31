import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatState } from '../interfaces/chatStatus.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatStatusService {
  private chatStateSubject = new BehaviorSubject<ChatState | null>(null);
  public chatState$ = this.chatStateSubject.asObservable();


  setChatState(state: ChatState) {
    this.chatStateSubject.next(state);
  }

  getCurrentChatState(): ChatState | null {
    return this.chatStateSubject.getValue();
  }
}