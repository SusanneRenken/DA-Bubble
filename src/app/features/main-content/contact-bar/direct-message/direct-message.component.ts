import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '../../../../shared/interfaces/user.interface';

@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.scss',
})
export class DirectMessageComponent implements OnInit {
  showMessages = false;
  activeUsers$!: Observable<any[]>;
  inactiveUsers$!: Observable<any[]>;

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    const usersCollection = collection(this.firestore, 'users');

    const users$ = collectionData(usersCollection, { idField: 'uID' }).pipe(
      map((users: any[]) =>
        users.map(
          (user) =>
            ({
              ...user,
              uStatus: String(user.uStatus),
            } as User)
        )
      )
    );
    this.activeUsers$ = users$.pipe(
      map((users: User[]) => users.filter((user) => user.uStatus === 'true'))
    );

    this.inactiveUsers$ = users$.pipe(
      map((users: User[]) => users.filter((user) => user.uStatus === 'false'))
    );
  }

  showAllMessages() {
    this.showMessages = !this.showMessages;
  }
}
