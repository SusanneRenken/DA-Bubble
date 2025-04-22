import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  keyframes,
} from '@angular/animations';

@Component({
  selector: 'app-logo',
  imports: [CommonModule],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
  animations: [
    trigger('logoPosition', [
      state('center', style({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(3.5)'
      })),
      state('topLeft', style({
        top: '75px',
        left: '75px',
        transform: 'translate(0, 0) scale(1)'
      })),
      transition('center => topLeft', [
        animate('1500ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ])
    ]),

    trigger('textAnimation', [
      state('hidden', style({
        width: '0px',
        opacity: 0,
        overflow: 'hidden'
      })),
      state('visible', style({
        width: '*',
        opacity: 1,
        overflow: 'visible'
      })),
      transition('hidden => visible', [
        animate('800ms cubic-bezier(0.0, 0.0, 0.2, 1)', keyframes([
          style({ width: '0px', opacity: 0, marginLeft: '0px', offset: 0 }),
          style({ width: '0px', opacity: 0, marginLeft: '5px', offset: 0.2 }),
          style({ width: '*', opacity: 1, marginLeft: '10px', offset: 1.0 })
        ]))
      ])
    ]),

    trigger('backgroundFade', [
      state('visible', style({
        backgroundColor: '#797ef3',
        color: 'white'
      })),
      state('hidden', style({
        backgroundColor: 'transparent',
        color: 'black'
      })),
      transition('visible => hidden', [
        animate('1500ms ease-in-out')
      ])
    ])
  ],
})
export class LogoComponent implements OnInit {
  logoPosition = 'center';
  textState = 'hidden';
  backgroundState = 'visible';

  ngOnInit() {
    localStorage.setItem('showAnimation', 'true');
    
    setTimeout(() => {
      this.textState = 'visible';
    }, 1000);

    setTimeout(() => {
      this.logoPosition = 'topLeft';
    }, 1800);

    setTimeout(() =>{
      this.backgroundState = 'hidden';
    }, 2400);
  }
}
