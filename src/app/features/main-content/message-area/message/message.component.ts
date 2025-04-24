import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ElementRef,
  HostListener,
  ViewChild,
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
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { PermanentDeleteComponent } from '../../../general-components/permanent-delete/permanent-delete.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message',
  imports: [PickerComponent, PermanentDeleteComponent, FormsModule],
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
  @Output() threadOpen = new EventEmitter<string>();

  @ViewChild('emojiPicker', { read: ElementRef }) emojiPickerRef?: ElementRef;
  @ViewChild('emojiBtn', { read: ElementRef }) emojiBtnRef?: ElementRef;
  @ViewChild('optionsMenu', { read: ElementRef }) optionsMenuRef?: ElementRef;
  @ViewChild('optionsBtn', { read: ElementRef }) optionsBtnRef?: ElementRef;
  @ViewChild('editTextarea', { read: ElementRef })
  editTextareaRef!: ElementRef<HTMLTextAreaElement>;

  activeUserData: User | null = null;
  senderData: User | null = null;
  groupedReactions: GroupedReaction[] = [];
  shownReactionNumber: number = 7;
  editText = '';
  threadSub: Subscription | null = null;
  replyCount = 0;
  lastReplyTime: Timestamp | null = null;

  isEmojiPickerOpen = false;
  isOptionsOpen = false;
  isPermanentDeleteOpen = false;
  isEditOpen = false;

  ngOnInit(): void {
    this.loadSenderData();
    this.loadActiveUserData();
    this.regroupReactions();
    this.loadThreadInfo();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message'] && changes['message'].currentValue) {
      this.regroupReactions();
    }
    if (changes['message']) {
      this.loadThreadInfo();
    }
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    this.threadSub?.unsubscribe();
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

  getTimeInHours(timestamp: Timestamp | null): string | undefined {
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

    return Array.from(grouped.entries()).map(([reaction, data]) => ({
      reaction,
      count: data.count,
      names: data.names,
      namesLine: this.buildNameLine(data.names),
      actionLine: this.buildActionLine(data.names, data.count),
    }));
  }

  buildNameLine(namesOriginal: string[], max = 3): string {
    const names = [...namesOriginal];
    const duIdx = names.indexOf('Du');
    if (duIdx > 0) {
      names.splice(duIdx, 1);
      names.unshift('Du');
    }
    if (names.length <= max) {
      return names.join(', ').replace(/, ([^,]*)$/, ' und $1');
    }

    const first = names.slice(0, max).join(', ');
    const rest = names.length - max;
    return `${first} und ${rest === 1 ? 'ein weiterer' : rest + ' weitere'}`;
  }

  loadThreadInfo() {
    this.threadSub?.unsubscribe();
    this.replyCount = 0;
    this.lastReplyTime = null;

    if (this.message.mThreadId && this.chatType !== 'thread') {
      this.threadSub = this.messageService
        .getThreadMessages(this.message.mThreadId)
        .subscribe((msgs) => {
          const replies = msgs.filter((m) => m.mId !== this.message.mId);
          this.replyCount = replies.length;
          if (replies.length) {
            this.lastReplyTime = replies[replies.length - 1].mTime as Timestamp;
          }
        });
    }
  }

  buildActionLine(names: string[], count: number): string {
    if (count === 1) {
      return names[0] === 'Du' ? 'hast reagiert' : 'hat reagiert';
    }
    return 'haben reagiert';
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

  toggleEmojiPicker(event: MouseEvent): void {
    event.stopPropagation();
    this.isEmojiPickerOpen = !this.isEmojiPickerOpen;
  }

  onEmojiPicked(e: any): void {
    const char = e.emoji?.native ?? e.emoji;

    if (this.isEditOpen && this.editTextareaRef) {
      const ta = this.editTextareaRef.nativeElement;
      const pos = ta.selectionStart ?? this.editText.length;

      const before = this.editText.slice(0, pos);
      const after = this.editText.slice(pos);
      this.editText = before + char + after;

      setTimeout(() => {
        const newPos = pos + char.length;
        ta.setSelectionRange(newPos, newPos);
        ta.focus();
      });

      return;
    }

    this.addReaction(char);
    this.isEmojiPickerOpen = false;
  }

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    if (
      (!this.isEmojiPickerOpen && !this.isOptionsOpen) ||
      this.isPermanentDeleteOpen
    )
      return;

    const target = event.target as HTMLElement;

    const insidePicker =
      this.emojiPickerRef?.nativeElement?.contains(target) ?? false;
    const onEmojiBtn =
      this.emojiBtnRef?.nativeElement?.contains(target) ?? false;

    const insideOptions =
      this.optionsMenuRef?.nativeElement?.contains(target) ?? false;
    const onOptionsBtn =
      this.optionsBtnRef?.nativeElement?.contains(target) ?? false;

    if (!insidePicker && !onEmojiBtn) {
      this.isEmojiPickerOpen = false;
    }
    if (!insideOptions && !onOptionsBtn) {
      this.isOptionsOpen = false;
    }
  }

  openProfil(): void {
    if (this.message.mSenderId) {
      this.profileClick.emit(this.message.mSenderId);
    }
  }

  toggleOptions(event: MouseEvent): void {
    event.stopPropagation();
    this.isOptionsOpen = !this.isOptionsOpen;
  }

  toggleEdit(): void {
    this.isEditOpen = !this.isEditOpen;
  }

  openEdit(): void {
    this.editText = this.message.mText ?? '';
    this.toggleEdit();
    setTimeout(() => this.editTextareaRef?.nativeElement.focus());
  }

  saveEdit(): void {
    if (!this.message.mId) {
      console.error('Es existiert keine mId für diese Message.');
      return;
    }

    const trimmed = this.editText.trim();

    if (trimmed === (this.message.mText ?? '').trim()) {
      this.toggleEdit();
      return;
    }

    this.messageService
      .editMessageText(this.message.mId, trimmed)
      .then(() => {
        this.message.mText = trimmed;
        this.toggleEdit();
        this.isOptionsOpen = false;
      })
      .catch((error) =>
        console.error('Fehler beim Editieren der Message:', error)
      );
  }

  togglePermanentDelete(): void {
    this.isPermanentDeleteOpen = !this.isPermanentDeleteOpen;
  }

  onThreadClick(): void {
    if (!this.message.mId) return;
    const tid = this.message.mThreadId || this.message.mId;

    const ensureThread = this.message.mThreadId
      ? Promise.resolve()
      : this.messageService.startThread(this.message.mId);

    ensureThread.then(() => {
      this.message.mThreadId = tid;
      this.threadOpen.emit(tid);
    });
  }


}
