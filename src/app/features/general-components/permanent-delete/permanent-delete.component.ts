import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../../shared/services/message.service';

type DeleteTarget = 'message' | 'channel' | 'user';

@Component({
  selector: 'app-permanent-delete',
  imports: [],
  templateUrl: './permanent-delete.component.html',
  styleUrl: './permanent-delete.component.scss',
})
export class PermanentDeleteComponent {
  private messageService = inject(MessageService);

  @Input({ required: true }) target!: DeleteTarget;
  @Input({ required: true }) id!: any;

  @Output() close = new EventEmitter<void>();

  onNo(): void {
    this.close.emit();
  }

  onYes(): void {
    switch (this.target) {
      case 'message':
        this.messageService
          .deleteMessage(this.id)
          .then(() => this.close.emit())
          .catch((err) =>
            console.error('Fehler beim Löschen der Nachricht', err)
          );
        break;

      case 'channel':
        console.log(`Der Channel mit der ID ${this.id} wird gelöscht`);
        // TODO: this.chService.deleteChannel(this.id) …
        this.close.emit();
        break;

      case 'user':
        console.log(`Der Account mit der ID ${this.id} wird gelöscht`);
        // TODO: this.userService.deleteUser(this.id) …
        this.close.emit();
        break;

      default:
        console.warn('Unbekannter Lösch‑Typ:', this.target);
        this.close.emit();
    }
  }
  get heading(): string {
    switch (this.target) {
      case 'message':
        return 'Nachricht permanent löschen?';
      case 'channel':
        return 'Channel permanent löschen?';
      case 'user':
        return 'Account permanent löschen?';
      default:
        return 'Permanent löschen?';
    }
  }
}
