import { Timestamp } from "@angular/fire/firestore";

export interface Message {
    mId?: string | null; 
    mText: string; 
    mReactions?: string[];
    mTime: Timestamp | any;
    mSenderId: string | null; 
    mUserId?: string | null;
    mThreadId?: string | null;
    mChannelId?: string | null;
}
  