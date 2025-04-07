import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Output, inject, NgZone, OnInit, Input} from '@angular/core';
import { Firestore, collection, doc, setDoc, serverTimestamp } from '@angular/fire/firestore';


@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss',
})
export class AddChannelComponent implements OnInit {
  private firestore = inject(Firestore);
  @Output() close = new EventEmitter<void>();
  @Input() activeUserId!: string | null;
  constructor(private elRef: ElementRef, private ngZone: NgZone) {}

  ngOnInit(): void {
    const originalConsoleWarn = console.warn;
    console.warn = (message?: any, ...optionalParams: any[]) => {
      if (
        typeof message === 'string' &&
        message.includes(
          'Calling Firebase APIs outside of an Injection context'
        )
      ) {
        return;
      }
      originalConsoleWarn(message, ...optionalParams);
    };
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.elRef.nativeElement
      .querySelector('section')
      ?.contains(event.target);
    if (!clickedInside) {
      this.close.emit();
    }
  }
  closeWindow() {
    this.close.emit();
  }

  async createChannel(name: string, description: string): Promise<void> {
    if (!name || !this.activeUserId) return; // Pflichtfelder prüfen
  
    const channelsCollectionRef = collection(this.firestore, 'channels');
    const newDocRef = doc(channelsCollectionRef);
    const newId = newDocRef.id;
  
    const channelData = {
      cName: name,
      cDescription: description,
      cId: newId,
      createdAt: serverTimestamp(),          
      cCreatedByUser: this.activeUserId,      
      cUserIds: {                           
        0: this.activeUserId
      }
    };
  
    this.ngZone.run(() => {
      setDoc(newDocRef, channelData)
        .then(() => this.close.emit())
        
    });
  }
  
  
}
