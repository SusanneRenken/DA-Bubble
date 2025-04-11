import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject, ChangeDetectorRef} from '@angular/core';
import { Channel } from '../../../shared/interfaces/channel.interface';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-channel-leave',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './channel-leave.component.html',
  styleUrl: './channel-leave.component.scss',
})
export class ChannelLeaveComponent implements OnInit {
  @Input() channelData: Channel | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() nameUpdated = new EventEmitter<string>();

  channelNameSave: boolean = false;
  descriptionSave: boolean = false;
  editedChannelName: string = '';
  editMode: boolean = true;
  isVisibleName: boolean = false;
  hasInteractedName: boolean = false;
  editDescription: boolean = true;
  editedDescription: string = '';
  isVisible: boolean = false;
  hasInteracted: boolean = false;
  createdByUserName: string = 'Unbekannt';

  firestore = inject(Firestore);

  constructor(private cdr: ChangeDetectorRef) {}


  ngOnInit(): void {
    const usersCollection = collection(this.firestore, 'users');
    collectionData(usersCollection, { idField: 'uId' })
      .pipe(
        map((users: any[]) =>
          users.find((user) => user.uId === this.channelData?.cCreatedByUser)
        )
      )
      .subscribe((user) => {
        if (user) {
          this.createdByUserName = user.uName;
        }
      });
  }


  toggleEdit() {
    this.hasInteractedName = true;
    this.isVisibleName = false;
    setTimeout(() => {
      this.editMode = !this.editMode;
      if (!this.editMode && this.channelData?.cName) {
        this.editedChannelName = this.channelData.cName;
      }
      this.isVisibleName = true;
    }, 200);
  }


  toggleDescription() {
    this.hasInteracted = true;
    this.isVisible = false;
    setTimeout(() => {
      this.editDescription = !this.editDescription;
      if (!this.editDescription) {
        this.editedDescription = '';
      }
      this.isVisible = true;
    }, 200);
  }


  closeWindow() {
    this.close.emit();
  }


  saveNewName() {
    const newName = this.editedChannelName.trim();
    if (!newName || !this.channelData?.cId) {
      return;
    }
    const channelRef = doc(this.firestore, 'channels', this.channelData.cId);
    updateDoc(channelRef, { cName: newName })
      .then(() => {
        this.channelData!.cName = newName;
        this.nameUpdated.emit(newName);
        this.toggleEdit();
      })
  }


  saveDescription() {
    const newDesc = this.editedDescription.trim();
    if (!newDesc || !this.channelData?.cId) {
      return;
    }
    const channelRef = doc(this.firestore, 'channels', this.channelData.cId);
    updateDoc(channelRef, { cDescription: newDesc })
      .then(() => {
        this.channelData!.cDescription = newDesc;
      })
  }
}
