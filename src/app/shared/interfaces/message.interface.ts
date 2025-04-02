import { Timestamp } from "@angular/fire/firestore";

export interface Message {
    mId?: string; 
    mText: string; 
    mReactions?: string[];
    mTime: Timestamp | any;
    mSenderId: string; 
    mUserId?: string;
    mThreadId?: string | null;
    mChannelId?: string;
}
  