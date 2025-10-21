export type AssigneeImgType = {
  assigneeName: string;
  assigneeImg: string;
  id: string;
};
export type TicketListingType = {
  id: number;
  assignedTo: AssigneeImgType[];
  ticketTitle: string;
  clientName: string;
  createDate: string;
  dueDate: string;
  priority: string;
  status: string;
  isChecked?: boolean;
};
