import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, inject } from '@angular/core';
import { Firestore, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  @Input() showButton: boolean = false;
  @Input() userName: any;
  @Input() userEmail: any;
  @Input() userImage: any;
  @Input() userStatus: any;
  @Input() activeUserId!: string | null;
  @Input() size: 'small' | 'big' = 'small';
  @Output() close = new EventEmitter<void>();
  @ViewChild('profilWrapper') profilWrapper?: ElementRef;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.isActive = this.userStatus === true || this.userStatus === 'true';
  }


  closeProfil() {
    this.close.emit();
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
}
