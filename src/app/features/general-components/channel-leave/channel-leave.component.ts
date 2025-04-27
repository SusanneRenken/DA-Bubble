import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject} from '@angular/core';
import { Channel } from '../../../shared/interfaces/channel.interface';
import { Firestore} from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/interfaces/user.interface';
import { ChannelService } from '../../../shared/services/channel.service';
import { DeviceVisibleComponent } from '../../../shared/services/responsive';
import { MemberListComponent } from '../member-list/member-list.component';
import { ProfilComponent } from '../profil/profil.component';
import { AddNewMembersComponent } from '../add-new-members/add-new-members.component';

@Component({
  selector: 'app-channel-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, DeviceVisibleComponent, MemberListComponent, ProfilComponent, AddNewMembersComponent],
  templateUrl: './channel-leave.component.html',
  styleUrl: './channel-leave.component.scss',
})
export class ChannelLeaveComponent implements OnInit {
  @Input() channelData: Channel | null = null;
  @Input() channelMembers:  User[] = [];
  @Input() activeUserId: string | null = null;  
  @Input() activChannelMemberProfil: User | null = null;
  @Input() newChannelMembers: boolean = false;
  @Input() channelId: any;
  @Input() channelName: string = '';
  @Input() isChannelMemberProfilOpen: boolean = false;

  @Output() newChannelMembersChange = new EventEmitter<boolean>();
  @Output() addMember = new EventEmitter<void>();
  @Output() showProfil = new EventEmitter<User>();
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
  animateOut = false;
  createdByUserName: string = 'Unbekannt';

  firestore = inject(Firestore);

  constructor(private userService: UserService, private channelService: ChannelService) {}


  ngOnInit(): void {
    this.userService.getEveryUsers()
      .pipe(
        map((users: User[]) =>
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

  async removeMember() {
    if (!this.activeUserId || !this.channelData?.cId) return;
    await this.channelService.removeUserFromChannel(
      this.channelData?.cId,
      this.activeUserId
    );
  }

  closeWindow() {  
    this.close.emit();
  }


  saveNewName() {
    const newName = this.editedChannelName.trim();
    if (!newName || !this.channelData?.cId) return;
    this.channelService.updateChannelName(this.channelData.cId, newName)
      .then(() => {
        this.channelData!.cName = newName;
        this.nameUpdated.emit(newName);
        this.toggleEdit();
      })
      .catch(() => {});
  }
  


  saveDescription() {
    const newDesc = this.editedDescription.trim();
    if (!newDesc || !this.channelData?.cId) return;
    this.channelService.updateChannelDescription(this.channelData.cId, newDesc)
      .then(() => {
        this.channelData!.cDescription = newDesc;
      })
      .catch(() => {});
  }


  closeAddMember() {
    this.animateOut = true;
    setTimeout(() => {
      this.newChannelMembers = false;
      this.animateOut = false;
      this.newChannelMembersChange.emit(this.newChannelMembers);
    }, 800);
  }
  
}
