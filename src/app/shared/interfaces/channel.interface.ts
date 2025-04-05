import { Timestamp } from "firebase/firestore";

export interface Channel {
    cId?: string | null;
    cName: string | null;
    cDescription: string | null; 
    cCreatedByUser: string; 
    cUserIds: string[];
    cTime: Timestamp | any;
}
  