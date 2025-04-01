import { Component, inject, Input, OnInit } from '@angular/core';
import { Message } from '../../../../shared/interfaces/message.interface';
import { Timestamp } from 'firebase/firestore';
import { UserService } from '../../../../shared/services/user.service';

@Component({
  selector: 'app-message',
  imports: [],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent implements OnInit {
  private userService = inject(UserService);
  user: string = '';  
  @Input() message!: Message;

  ngOnInit(): void {
    this.userService.getUser(this.message.mSenderId)
      .then((userData) => {
        this.user = userData.name || 'Unbekannt';
      })
      .catch((error) => {
        console.error('Fehler beim Laden des Users:', error);
        this.user = 'Fehler';
      });
  }


  getTimeInHours(timestamp: Timestamp): any {
    if (timestamp instanceof Timestamp) {
      const date = timestamp.toDate();
      const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      return time;
    }
  }
}
