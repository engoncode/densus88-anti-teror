export interface Chat {
  id: string;
  avatar: string;
  name: string;
  text: string;
  time: number;
  textCount: number;
  color: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  time: Date;
}
