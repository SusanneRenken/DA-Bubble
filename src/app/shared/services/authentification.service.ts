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
  public registrationData: {
    email: string;
    password: string;
    username: string;
  } | null = null;

  constructor() {}

  async prepareRegistration(email: string, password: string, username: string): Promise<void | UserCredential> {
    const usersCollection = collection(this.firestore, 'users');
    const q = query(usersCollection, where('uEmail', '==', email));
    return getDocs(q).then((querySnapshot) => {
      if (!querySnapshot.empty) return Promise.reject('User with this email is found');
      this.registrationData = {
        email,
        password,
        username
      };
      return Promise.resolve();
    });
  }

  async completeRegistration(profilePictureUrl: string): Promise<void | UserCredential> {
    if (!this.registrationData) return Promise.reject('No active registration available');  
    const { email, password, username } = this.registrationData;
    return createUserWithEmailAndPassword(this.auth, email, password)
    .then((userCredential) => {
      const uid = userCredential.user.uid;
      const userData: UserInterface = {
        uId: uid,
        uName: username,
        uEmail: email,
        uUserImage: 'assets/img/' + profilePictureUrl,
        uStatus: false,
        uLastReactions: ['👍', '😊']
      };
      const userRef = collection(this.firestore, 'users');
      const userDocRef = doc(userRef, uid);
      return setDoc(userDocRef, userData).then(() => {
        this.registrationData = null;
        return userCredential;
      });
    });
  }

  async loginWithEmail(email: string, password: string): Promise<void | UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password)
    .then((result) => {
      this.currentUid = result.user.uid;
      const userRef = collection(this.firestore, 'users');
      const userDocRef = doc(userRef, this.currentUid);
      return updateDoc(userDocRef, { uStatus: true }).then(() => result);
    });
  }

  async loginWithGoogle(): Promise<void | UserCredential> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider)
    .then((result) => {
      this.currentUid = result.user.uid;
      const userData: UserInterface = {
        uId: this.currentUid,
        uName: result.user.displayName || '',
        uEmail: result.user.email || '',
        uUserImage: result.user.photoURL || 'assets/img/profile.png',
        uStatus: true,
        uLastReactions: ['👍', '😊']
      };
      const userRef = collection(this.firestore, 'users');
      const userDocRef = doc(userRef, result.user.uid);
      return setDoc(userDocRef, userData, { merge: true }).then(() => result);
    });
  }

  async loginAsGuest(): Promise<void | UserCredential> {
    return signInAnonymously(this.auth)
    .then((result) => {
      this.currentUid = result.user.uid;
      const guestData: UserInterface = {
        uId: this.currentUid,
        uName: 'Guest',
        uEmail: '',
        uUserImage: 'assets/img/profile.png',
        uStatus: true,
        uLastReactions: ['👍', '😊']
      };
      const userRef = collection(this.firestore, 'users');
      const userDocRef = doc(userRef, this.currentUid);
      return setDoc(userDocRef, guestData, { merge: true }).then(() => result);
    });
  }

  async sendResetPasswordEmail(email: string): Promise<void> {
    const actionCodeSettings = {
      url: 'http://localhost:4200/access',
      handleCodeInApp: true,
    };
    const usersCollection = collection(this.firestore, 'users');
    const q = query(usersCollection, where('uEmail', '==', email));
    return getDocs(q).then((querySnapshot) => {
      if (querySnapshot.empty) return Promise.reject('No user with this email found');
      return sendPasswordResetEmail(this.auth, email, actionCodeSettings);
    });
  }

  async confirmResetPassword(oobCode: string, newPassword: string): Promise<void> {
    return confirmPasswordReset(this.auth, oobCode, newPassword);
  }

  async logout(): Promise<void> {
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
      const oldUid = this.currentUid;
      if (oldUid) {
        const userRef = collection(this.firestore, 'users');
        const userDocRef = doc(userRef, oldUid);
        return updateDoc(userDocRef, { uStatus: false });
      } else {
        return Promise.resolve();
      }
    }).then(() => {
      this.currentUid = null;
      return this.auth.signOut();
    });
  }
}
