export type AgentListingType = {
  id: number;
  joining_date: string | Date;
  img: string | any;
  img_alt: string;
  name: string;
  property: string;
  location: string;
  email: string;
  contact: string;
  status: string;
  new: boolean;
  isCheck?: boolean;
};
