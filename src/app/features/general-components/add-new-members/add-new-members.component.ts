import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../../shared/interfaces/user.interface';
import { ChannelService } from '../../../shared/services/channel.service';
import { UserService } from '../../../shared/services/user.service';
import { FormsModule } from '@angular/forms';
import { NewMembersPopUpComponent } from './new-members-pop-up/new-members-pop-up.component';
import { firstValueFrom } from 'rxjs';

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
 

  constructor(private channelService: ChannelService, private userService: UserService) {}

  emitClose() {
    this.close.emit();
  }

  
  memberNameAdd(memberName: any, memberImage: any, memberId: any) {
    this.memberInputAdd = memberName;
    this.memberInputImage = memberImage;
    this.memberInputId = memberId;
    this.memberAddElement = true;
    this.showMember = false;
  }
  

  inputNameClose(): void {
    this.memberAddElement = false;
    this.memberInputAdd = '';
    this.memberInputImage = '';
    this.memberInputId = '';
  }


  addNewChannelMember() {
    if (this.memberAddElement === true && this.channelId && this.memberInputId) {
      this.channelService.addUserToChannel(this.channelId, this.memberInputId)
      this.inputNameClose()
      this. emitClose()
        
    }
  }

  
  private async getSelectedUserIds(): Promise<string[]> {
    let userIds: string[] = [];
    if (this.selectedOption === 'option1') {
      const allUsers = await firstValueFrom(this.userService.getEveryUsers());
      userIds = allUsers
        .map(user => user.uId)
        .filter((id): id is string => typeof id === 'string');
    } else if (this.selectedOption === 'option2') {
      userIds = [this.memberInputId];
    }
    return userIds;
  }
  

  async createNewChannel(name: string, description: string) {
    if (!name || !this.activeUserId) return;
    let userIds = await this.getSelectedUserIds();
    if (!userIds.includes(this.activeUserId)) {
      userIds.unshift(this.activeUserId);
    }
    const newChannelId = await this.userService.createChannelWithUsers(
      name,
      description,
      this.activeUserId,
      userIds
    );
    this.channelId = newChannelId;
    this.inputNameClose();
    this.emitClose();
  }
}
