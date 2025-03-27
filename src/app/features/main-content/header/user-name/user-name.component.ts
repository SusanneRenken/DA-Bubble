import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-user-name',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-name.component.html',
  styleUrl: './user-name.component.scss'
})
export class UserNameComponent {
  isLogOutVisible: boolean = false;

  @ViewChild('logOutBox') logOutBox?: ElementRef;
  @ViewChild('toggleBtn') toggleBtn?: ElementRef;

  toggleLogOut() {
    this.isLogOutVisible = !this.isLogOutVisible;
    setTimeout(() => {}, 0);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInsideLogOut = this.logOutBox?.nativeElement?.contains(event.target);
    const clickedToggleBtn = this.toggleBtn?.nativeElement?.contains(event.target);
    if (!clickedInsideLogOut && !clickedToggleBtn) {
      this.isLogOutVisible = false;
    }
  }
}
