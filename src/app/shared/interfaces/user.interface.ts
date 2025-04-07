export interface UserInterface {
  uId: string;
  uName: string;
  uEmail: string;
  uUserImage: string;
  uStatus: boolean;
=======
export interface User {
    uId?: string; 
    uName: string; 
    uEmail: string;
    uPassword?: string;
    uStatus: string; 
    uUserImage: string;
>>>>>>> 021d7d0 (Change main-content 15)
}
