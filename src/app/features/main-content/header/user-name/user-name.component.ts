import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ProfilComponent } from '../../profil/profil.component';

@Component({
  selector: 'app-user-name',
  standalone: true,
  imports: [CommonModule, ProfilComponent],
  templateUrl: './user-name.component.html',
  styleUrl: './user-name.component.scss'
})
export class UserNameComponent {
  isLogOutVisible: boolean = false;
  showProfil: boolean = false;

  @ViewChild('logOutBox') logOutBox?: ElementRef;
  @ViewChild('toggleBtn') toggleBtn?: ElementRef;
  @ViewChild('profilWrapper') profilWrapper?: ElementRef;


  toggleLogOut() {
    this.isLogOutVisible = !this.isLogOutVisible;
    setTimeout(() => {}, 0);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInsideLogOut = this.logOutBox?.nativeElement?.contains(event.target);
    const clickedToggleBtn = this.toggleBtn?.nativeElement?.contains(event.target);
    const clickedInsideProfil = this.profilWrapper?.nativeElement?.contains(event.target); // ✔️
  
    if (!clickedInsideLogOut && !clickedToggleBtn && !clickedInsideProfil) {
      this.isLogOutVisible = false;
    }
  }

  openProfil() {
    this.showProfil = true;
  }
}
