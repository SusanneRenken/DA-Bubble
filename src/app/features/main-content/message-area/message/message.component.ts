import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Message } from '../../../../shared/interfaces/message.interface';
import { Timestamp } from 'firebase/firestore';
import { UserService } from '../../../../shared/services/user.service';
import { User } from '../../../../shared/interfaces/user.interface';
import {
  GroupedReaction,
  Reaction,
} from '../../../../shared/interfaces/reaction.interface';
import { Subscription } from 'rxjs';
import { MessageService } from '../../../../shared/services/message.service';

@Component({
  selector: 'app-message',
  imports: [],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
})
export class MessageComponent implements OnInit {
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private userSubscription: Subscription | null = null;

  @Input() chatType: 'private' | 'channel' | 'thread' | 'new' | null = null;
  @Input() message!: Message;
  @Input() activeUserId: string | null = null;

  @Output() profileClick = new EventEmitter<string>();

  activeUserData: User | null = null;
  senderData: User | null = null;
  groupedReactions: GroupedReaction[] = [];
  shownReactionNumber: number = 7;

  ngOnInit(): void {
    this.loadSenderData();
    this.loadActiveUserData();
    this.regroupReactions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message'] && changes['message'].currentValue) {
      this.regroupReactions();
    }
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

  loadSenderData() {
    this.userService
      .getUser(this.message.mSenderId)
      .then((userData) => {
        this.senderData = userData;
      })
      .catch((error) => {
        console.error('Fehler beim Laden des Users:', error);
      });
  }

  loadActiveUserData(): void {
    if (this.activeUserId) {
      this.userSubscription = this.userService
        .getUserRealtime(this.activeUserId)
        .subscribe({
          next: (user) => {
            this.activeUserData = user;
          },
          error: (err) =>
            console.error('Fehler beim User-Live-Datenabruf', err),
        });
    }
  }

  regroupReactions(): void {
    if (this.message.mReactions && this.activeUserId) {
      this.groupedReactions = this.groupReactionsWithNames(
        this.message.mReactions,
        this.activeUserId
      );
    } else {
      this.groupedReactions = [];
    }
  }

  setShownReactionNumber() {
    if (this.shownReactionNumber < this.groupedReactions.length) {
      this.shownReactionNumber = this.groupedReactions.length;
    } else {
      this.shownReactionNumber = 7;
    }
  }

  getTimeInHours(timestamp: Timestamp): string | undefined {
    if (timestamp instanceof Timestamp) {
      const date = timestamp.toDate();
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return undefined;
  }

  groupReactionsWithNames(
    reactions: Reaction[],
    activeUserId: string
  ): GroupedReaction[] {
    const grouped = new Map<string, { count: number; names: string[] }>();

    reactions.forEach((r) => {
      const key = r.reaction;
      const displayName = r.userId === activeUserId ? 'Du' : r.userName;

      if (grouped.has(key)) {
        const group = grouped.get(key)!;
        group.count++;
        if (!group.names.includes(displayName)) {
          group.names.push(displayName);
        }
      } else {
        grouped.set(key, { count: 1, names: [displayName] });
      }
    });

    return Array.from(grouped.entries()).map(([reaction, data]) => {
      const duIndex = data.names.indexOf('Du');
      if (duIndex !== -1 && duIndex !== 0) {
        data.names.splice(duIndex, 1);
        data.names.unshift('Du');
      }

      return {
        reaction,
        count: data.count,
        names: data.names,
      };
    });
  }

  addReaction(reaction: string): void {
    if (!this.message.mId) {
      console.error('Es existiert keine mId für diese Message.');
      return;
    }

    if (!this.activeUserId) {
      console.error('Es existiert keine activeUserId.');
      return;
    }

    this.userService
      .editLastReactions(this.activeUserId, reaction)
      .then(() => this.loadActiveUserData())
      .catch((error) =>
        console.error('Fehler beim Editieren der Reaction:', error)
      );
  
    this.messageService
      .toggleReaction(this.message.mId, {
        reaction: reaction,
        userId: this.activeUserId,
        userName: this.activeUserData?.uName ?? '',
      })
      .catch((error) =>
        console.error('Fehler beim Hinzufügen/Entfernen der Reaction', error)
      );
  }

  openProfil(): void {
    if (this.message.mSenderId) {
      this.profileClick.emit(this.message.mSenderId);
    }
  }
}
