import { Injectable, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { UserInterface } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = inject(Firestore);

  async getAllUsers(): Promise<UserInterface[]> {
    const usersCollectionRef = collection(this.firestore, 'users');
    const querySnapshot = await getDocs(usersCollectionRef);
    const allUsers: UserInterface[] = [];

    querySnapshot.forEach((docSnap) => {
      const userData = { ...(docSnap.data() as UserInterface), id: docSnap.id };
      allUsers.push(userData);
    });

    return allUsers;
  }

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

  async getFilteredUsers(userIds: string[]): Promise<UserInterface[]> {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    const results: UserInterface[] = [];

    for (const id of userIds) {
      const docRef = doc(this.firestore, 'users', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data() as UserInterface;
        results.push(userData);
      } else {
        console.warn(`User not found for ID: ${id}`);
      }
    }

    return results;
  }
}
