export interface Message {
    mId: string; 
    mText: string; 
    mReactions: string;
    mTime: number | null;
    mSenderId: string; 
    mUserId: string;
    mThreadId: string | null;
    mChannelId: string;
}
  