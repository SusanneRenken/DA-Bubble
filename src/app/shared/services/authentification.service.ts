import { inject, Injectable } from '@angular/core';
import { UserInterface } from '../interfaces/user.interface';
import {
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import {
  Auth,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  UserCredential,
} from '@angular/fire/auth';
import { collection } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthentificationService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);

  public currentUid: string | null = null;
  public resetUser: UserInterface | null = null;

  constructor() {}

  registerWithEmail(email: string, password: string, username: string): Promise<void | UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password).then(
      (userCredential) => {
        this.currentUid = userCredential.user.uid;
        const userData: UserInterface = {
          uId: this.currentUid,
          uName: username,
          uEmail: email,
          uUserImage: '',
          uStatus: false,
        };
        const userRef = collection(this.firestore, 'users');
        const userDocRef = doc(userRef, this.currentUid);
        return setDoc(userDocRef, userData);
      }
    );
  }

  updateProfilePicture(profilePictureUrl: string): Promise<void | UserCredential> {
    if (!this.currentUid) {
      return Promise.reject('No ongoing registration');
    }
    const userRef = collection(this.firestore, 'users');
    const userDocRef = doc(userRef, this.currentUid);
    return updateDoc(userDocRef, { uUserImage: profilePictureUrl }).then(() => {
      this.currentUid = null;
    });
  }

  loginWithEmail(email: string, password: string): Promise<void | UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password).then(
      (result) => {
        this.currentUid = result.user.uid;
        const userRef = collection(this.firestore, 'users');
        const userDocRef = doc(userRef, this.currentUid);
        return updateDoc(userDocRef, { uStatus: true }).then(() => result);
      }
    );
  }

  loginWithGoogle(): Promise<void | UserCredential> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider).then((result) => {
      this.currentUid = result.user.uid;
      const userData: UserInterface = {
        uId: this.currentUid,
        uName: result.user.displayName || '',
        uEmail: result.user.email || '',
        uUserImage: result.user.photoURL || '',
        uStatus: true,
      };
      const userRef = collection(this.firestore, 'users');
      const userDocRef = doc(userRef, result.user.uid);
      return setDoc(userDocRef, userData, { merge: true }).then(() => result);
    });
  }

  loginAsGuest(): Promise<void | UserCredential> {
    return signInAnonymously(this.auth).then((result) => {
      this.currentUid = result.user.uid;
      const guestData: UserInterface = {
        uId: this.currentUid,
        uName: 'Guest',
        uEmail: '',
        uUserImage: 'default-guest.png',
        uStatus: false,
      };
      const userRef = collection(this.firestore, 'users');
      const userDocRef = doc(userRef, this.currentUid);
      return setDoc(userDocRef, guestData, { merge: true }).then(() => result);
    });
  }

  sendResetPasswordEmail(email: string): Promise<void> {
    const actionCodeSettings = {
      url: 'http://localhost:4200/access',
      handleCodeInApp: true,
    };

    const usersCollection = collection(this.firestore, 'users');
    const q = query(usersCollection, where('uEmail', '==', email));
    return getDocs(q).then((querySnapshot) => {
      if (querySnapshot.empty) {
        return Promise.reject('No user with this email found');
      }
      const userDoc = querySnapshot.docs[0];
      this.resetUser = userDoc.data() as UserInterface;
      return sendPasswordResetEmail(this.auth, email, actionCodeSettings);
    });
  }

  confirmResetPassword(oobCode: string, newPassword: string): Promise<void> {
    return confirmPasswordReset(this.auth, oobCode, newPassword).then(() => {
      this.resetUser = null;
    });
  }

  logout(): Promise<void> {
    const uid = this.currentUid;
    const currentUser = this.auth.currentUser;
    let deletePromise: Promise<any>;
    if (currentUser && currentUser.isAnonymous && uid) {
      const userRef = collection(this.firestore, 'users');
      const userDocRef = doc(userRef, uid);
      deletePromise = deleteDoc(userDocRef)
      .then(() => {
        return currentUser.delete();
      });
    } else {
      deletePromise = Promise.resolve();
    }
    return deletePromise.then(() => {
      this.currentUid = null;
      return this.auth.signOut();
    });
  }
}
