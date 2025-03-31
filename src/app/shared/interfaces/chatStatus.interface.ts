export interface ChatState {
    type: 'private' | 'channel' | 'thread' | 'new';
    id: string;
  }