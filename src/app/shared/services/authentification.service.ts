import { inject, Injectable } from '@angular/core';
import { UserInterface } from '../interfaces/user.interface';
import { doc, Firestore, setDoc, updateDoc } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from '@angular/fire/auth';
import { collection } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthentificationService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);

  public currentUid: string | null = null;

  constructor() {}

  registerWithEmail(email: string, password: string, username: string) {
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then(userCredential => {
        this.currentUid = userCredential.user.uid;
        const userData: UserInterface = {
          uId: this.currentUid,
          uName: username,
          uEmail: email,
          uUserImage: '',
          uStatus: false
        };
        const userRef = collection(this.firestore, "users");
        const userDocRef = doc(userRef, this.currentUid);
        return setDoc(userDocRef, userData);
      }
    );
  }

  updateProfilePicture(profilePictureUrl: string) {
    if (!this.currentUid) {
      return Promise.reject('No ongoing registration');
    }
    const userRef = collection(this.firestore, "users");
    const userDocRef = doc(userRef, this.currentUid);
    return updateDoc(userDocRef, { uUserImage: profilePictureUrl });
  }

  loginWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  logout() {
    return this.auth.signOut();
  }
}
