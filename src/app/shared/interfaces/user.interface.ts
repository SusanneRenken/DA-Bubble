export interface UserInterface {
  uId: string;
  uName: string;
  uEmail: string;
  uUserImage: string;
  uStatus: boolean;
}

export interface User {
    uId?: string; 
    uName: string; 
    uEmail: string;
    uStatus: boolean; 
    uUserImage: string;
    uLastReactions: string[];
}


