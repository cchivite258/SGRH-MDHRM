export type MessageType = {
  src: string;
  name: string;
  time: string;
  message: string;
  replies?: MessageType[];
  images?: string[];
};
