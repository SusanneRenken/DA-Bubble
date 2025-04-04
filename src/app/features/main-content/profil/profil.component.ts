import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, } from '@angular/core';


@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.scss',
})
export class ProfilComponent {
  isActive: boolean = true;
  showEditProfil: boolean = false;
  @Input() showButton: boolean = false;
  @Input() size: 'small' | 'middle'  | 'big' = 'small';
  @Output() close = new EventEmitter<void>();
  @ViewChild('profilWrapper') profilWrapper?: ElementRef;

  closeProfil() {
    this.close.emit();
  }

 
  onMainClick(event: MouseEvent) {
    const insideSection = this.profilWrapper?.nativeElement?.contains(
      event.target
    );
    if (!insideSection) {
      this.close.emit();
    }
  }
  
  onEditClick(){
    this.showEditProfil = true;
    this.size = 'middle';
  }
}
