import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { UserInterface } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = inject(Firestore);

  async getUser(userId: string | null): Promise<UserInterface> {
    if (!userId) {
      return Promise.reject(new Error('Invalid userId: null'));
    }
    const userDocRef = doc(this.firestore, 'users', userId);
    return getDoc(userDocRef).then((docSnap) => {
      if (docSnap.exists()) {
        return docSnap.data() as UserInterface;
      } else {
        throw new Error('User not found');
      }
    });
  }

}
