import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, inject } from '@angular/core';
import { Firestore, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.scss',
})

export class ProfilComponent {
  firestore = inject(Firestore);
  isActive: boolean = true;
  showEditProfil: boolean = false;
  editedUserName: string = '';
  items = [1, 2, 3, 4, 5, 6];

  
  @Input() showButton: boolean = false;
  @Input() userName: any;
  @Input() userEmail: any;
  @Input() userImage: any;
  @Input() userStatus: any;
  @Input() activeUserId!: any;
  @Input() size: 'small' | 'big' = 'small';
  @Output() close = new EventEmitter<void>();
  @ViewChild('profilWrapper') profilWrapper?: ElementRef;

  showAvatarChoice = false;

  private originalUserImage!: string;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    this.isActive = this.userStatus === true || this.userStatus === 'true';
    this.originalUserImage = this.userImage;
  }


  closeProfil() {
    this.showAvatarChoice = false;
    this.close.emit();
  }

  async saveAvatarChange(): Promise<void> {
    try {
      await this.userService.updateUserImage(this.activeUserId, this.userImage);
      this.originalUserImage = this.userImage;
    }finally {
      this.showAvatarChoice = false;
    }
  }


  changeUserName() {
    if (!this.activeUserId || !this.editedUserName.trim()) return;
    const userRef = doc(this.firestore, 'users', this.activeUserId);
    updateDoc(userRef, {
      uName: this.editedUserName.trim(),
    }).then(() => {
      this.userName = this.editedUserName;
      this.showEditProfil = false;
    });
  }


  onMainClick(event: MouseEvent) {
    const insideSection = this.profilWrapper?.nativeElement?.contains(
      event.target
    );
    if (!insideSection) {
      this.close.emit();
    }
  }


  onEditClick() {
    this.showEditProfil = true;
  }

  
  async deleteMember() {
    if (!this.activeUserId) return;
    const userRef = doc(this.firestore, 'users', this.activeUserId);
    await deleteDoc(userRef);
    this.router.navigate(['/access']);
  }

  selectAvatar(item: number): void {
    this.userImage = `avatar-${item}.png`;
    this.showAvatarChoice = false;
  }

  bigUserImg(): void {
    this.showAvatarChoice = !this.showAvatarChoice;
  }

  trackById(index: number, id: number) {
    return id;
  }
}
