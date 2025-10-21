export type ContactsType = {
  id: number;
  name: string;
  status: string;
  roomId: number;
  profile?: string;
  src?: string;
};

export type ChatContactDataType = {
  title: string;
  contacts: ContactsType[];
};
