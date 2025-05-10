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
        apiKey: 'AIzaSyAhQi1adgAX2v3PLkdRUDRJr48llcDiTPU',
        authDomain: 'dabubble-586d2.firebaseapp.com',
        projectId: 'dabubble-586d2',
        storageBucket: 'dabubble-586d2.firebasestorage.app',
        messagingSenderId: '155220965649',
        appId: '1:155220965649:web:5f87c097ce167fbcc4b4b0',
        measurementId: 'G-4KEKXPJ8CK',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideAnimations(),
  ],
};
