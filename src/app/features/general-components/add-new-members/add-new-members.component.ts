import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../../shared/interfaces/user.interface';
import { ChannelService } from '../../../shared/services/channel.service';
import { UserService } from '../../../shared/services/user.service';
import { FormsModule } from '@angular/forms';
import { NewMembersPopUpComponent } from './new-members-pop-up/new-members-pop-up.component';

@Component({
  selector: 'app-add-new-members',
  standalone: true,
  imports: [CommonModule, FormsModule, NewMembersPopUpComponent],
  templateUrl: './add-new-members.component.html',
  styleUrl: './add-new-members.component.scss'
})

export class AddNewMembersComponent {
  selectedOption: string = '';
  @Input() channelMembers: User[] = [];
  @Input() activeUserId!: string | null;
  @Input() channelId: any = '';
  @Input() channelName: any = '';
  @Input() showInput: boolean = true;
  @Input() channelDescription: string = '';
  @Input() showXLine: boolean = false; 
  @Output() close = new EventEmitter<void>();
  @Output() addMember = new EventEmitter<void>();
  @Output() showProfil = new EventEmitter<User>();
  
  memberAddElement: boolean = false;
  memberInputId: string = '';
  memberInputAdd: string = '';
  memberInputImage: string = '';
  showMember: boolean = false;
  selectedUserIds: string[] = [];
 

  constructor(private channelService: ChannelService, private userService: UserService) {}

  emitClose() {
    this.close.emit();
  }

  memberNameAdd(memberName: string, memberImage: string, memberId: string) {
    this.memberInputAdd   = memberName;
    this.memberInputImage = memberImage;
    this.memberInputId    = memberId;
    console.log(this.memberInputId);
    
    if (!this.selectedUserIds.includes(memberId)) {
      this.selectedUserIds.push(memberId);
    }
  
    this.memberAddElement = true;
    this.showMember       = false;
  }
  

  inputNameClose(): void {
    this.memberAddElement = false;
    this.memberInputAdd = '';
    this.memberInputImage = '';
    this.memberInputId = '';
  }


  async addNewChannelMembers() {
    if (!this.channelId || this.selectedUserIds.length === 0) return;
    try {
      await this.channelService.addUsersToChannel(
        this.channelId,
        ...this.selectedUserIds
      );
      this.selectedUserIds = [];
      this.close.emit();
    } catch (err) {}
  }  

  async createNewChannel(name: string, description: string) {
    if (!name || !this.activeUserId) return;
    const ids = [...this.selectedUserIds];
    if (!ids.includes(this.activeUserId)) {
      ids.unshift(this.activeUserId);
    }
    const newChannelId = await this.userService.createChannelWithUsers(
      name,
      description,
      this.activeUserId,
      ids
    );
    this.emitClose()
  }
  

  onMemberAdded(userId: string) {
    if (!this.selectedUserIds.includes(userId)) {
      this.selectedUserIds.push(userId);
    }
  }
  

  onMemberRemoved(userId: string) {
    this.selectedUserIds = this.selectedUserIds.filter(id => id !== userId);
  }
}
