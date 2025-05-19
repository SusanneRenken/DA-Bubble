import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: 'AIzaSyC1_gsLUX0JLsirzOTxycXWATziycQmjmY',
        authDomain: 'dabubble-98d0a.firebaseapp.com',
        projectId: 'dabubble-98d0a',
        storageBucket: 'dabubble-98d0a.firebasestorage.app',
        messagingSenderId: '1080008323640',
        appId: '1:1080008323640:web:3215454c04e96e2ddc2ccd',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideAnimations(),
  ],
};
