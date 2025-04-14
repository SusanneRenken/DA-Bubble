import { CommonModule} from '@angular/common';
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, SimpleChanges, OnChanges} from '@angular/core';
import { User } from '../../../../shared/interfaces/user.interface';
import { ProfilComponent } from '../../../general-components/profil/profil.component';


@Component({
  selector: 'app-channel-members',
  imports: [CommonModule, ProfilComponent],
  templateUrl: './channel-members.component.html',
  styleUrl: './channel-members.component.scss'
})
export class ChannelMembersComponent implements OnChanges {
  @Input() channelMembers:  User[] = [];
  @Input() activeUserId: string | null = null;
  
  @Output() close = new EventEmitter<void>();
  @ViewChild('channelWrapper') channelWrapper?: ElementRef;

  activChannelMemberProfil: User | null = null;

  isChannelMemberProfilOpen: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['channelMembers']) {
      console.log(
        'Channel Members in ngOnChanges:',
        changes['channelMembers'].currentValue
      );
    }
  }

  closeChannelMembers() {
    this.close.emit();
  }
 
  onMainClick(event: MouseEvent) {
    const insideSection = this.channelWrapper?.nativeElement?.contains(
      event.target
    );
    if (!insideSection) {
      this.close.emit();
    }
  }

  toggleMemberProfil(member?: User) {
    console.log('Clicked on member:', member);
    
    this.isChannelMemberProfilOpen = !this.isChannelMemberProfilOpen;
    if (member) {
      this.activChannelMemberProfil = member;
    }
    else {
      this.activChannelMemberProfil = null;
    }
  }

  
}
