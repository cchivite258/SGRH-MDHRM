import { MenuSelectItemType } from "@/app/common/components/filters/types";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { TableHeaderType } from "@/app/common/types/table.types";
import {
  Avatar1,
  Avatar2,
  Avatar3,
  Avatar4,
  Avatar5,
  Avatar6,
  Avatar7,
  Avatar8,
  Avatar9,
  Avatar10,
} from "@/assets/images/users/utils";
import {
  TicketListingType,
  AssigneeImgType,
} from "@/components/tickets/list/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "support-tickets",
    disabled: false,
  },
  {
    title: "list-view",
    disabled: true,
  },
];

export const tickets = [
  {
    endVal: 249,
    suffix: "K",
    type: "Total Tickets",
    percent: "+3.47%",
    isSuccess: true,
    icon: "ph-ticket ph-lg",
    color: "success",
  },
  {
    endVal: 3174,
    type: "Pending Tickets",
    percent: "+6.33%",
    icon: "ph-hourglass-medium ph-lg",
    color: "warning",
  },
  {
    endVal: 1596,
    type: "Closed Tickets",
    percent: "+7.34%",
    isSuccess: true,
    icon: "ph-lock-simple ph-lg",
    color: "danger",
  },
  {
    endVal: 365,
    type: "New Tickets",
    percent: "+1.29%",
    icon: "ph-ticket ph-lg",
    color: "info",
  },
];

export const ticketHeaders: TableHeaderType[] = [
  { title: "", isCheck: true },
  { title: "ID" },
  { title: "Assigned To" },
  { title: "Ticket Title" },
  { title: "Client Name" },
  { title: "Create Date" },
  { title: "Due Date" },
  { title: "Priority" },
  { title: "Status" },
  { title: "Action" },
];

export const ticketList: TicketListingType[] = [
  {
    id: 1,
    assignedTo: [
      {
        id: "avatar1",
        assigneeName: "Stefanie Cartwright",
        assigneeImg: Avatar1,
      },
      {
        id: "avatar2",
        assigneeName: "Marisol Gaylord",
        assigneeImg: Avatar2,
      },
    ],
    ticketTitle: "Webstorm does not recognize tags",
    clientName: "Domenic Dach",
    createDate: "17 Jan, 2023",
    dueDate: "23 Jan, 2023",
    priority: "low",
    status: "pending",
  },
  {
    id: 2,
    assignedTo: [
      {
        id: "avatar5",
        assigneeName: "Merlin Heaney",
        assigneeImg: Avatar3,
      },
      {
        id: "avatar6",
        assigneeName: "Alexys Collier",
        assigneeImg: Avatar4,
      },
      {
        assigneeName: "Kyla O'Hara",
        assigneeImg: Avatar5,
        id: "avatar7",
      },
    ],
    ticketTitle: "Form error style for input addonAfter slot",
    clientName: "Prezy Mark",
    createDate: "29 Jan, 2023",
    dueDate: "06 Feb, 2023",
    priority: "medium",
    status: "open",
  },
  {
    id: 3,
    assignedTo: [
      {
        id: "avatar8",
        assigneeName: "Twila Stark",
        assigneeImg: Avatar6,
      },
      {
        assigneeName: "Bennett Rice",
        assigneeImg: Avatar7,
        id: "avatar9",
      },
      {
        id: "avatar10",
        assigneeName: "Dusty Hackett",
        assigneeImg: Avatar8,
      },
      {
        id: "avatar1",
        assigneeName: "Stefanie Cartwright",
        assigneeImg: Avatar1,
      },
    ],
    ticketTitle: "Not following the ReactJS folder structure",
    clientName: "Nelson Schaden",
    createDate: "01 Feb, 2023",
    dueDate: "07 Feb, 2023",
    priority: "high",
    status: "pending",
  },
  {
    id: 4,
    assignedTo: [
      {
        id: "avatar2",
        assigneeName: "Marisol Gaylord",
        assigneeImg: Avatar2,
      },
    ],
    ticketTitle: "Error message when placing an orders?",
    clientName: "Deondre Huel",
    createDate: "13 Feb, 2023",
    dueDate: "19 Feb, 2023",
    priority: "low",
    status: "new",
  },
  {
    id: 5,
    assignedTo: [
      {
        id: "avatar11",
        assigneeName: "Ines Stracke",
        assigneeImg: Avatar9,
      },
      {
        id: "avatar12",
        assigneeName: "Abner Wisozk",
        assigneeImg: Avatar10,
      },
    ],
    ticketTitle: "Forgetting to start a component name with a capital letter",
    clientName: "Sarai Schmidt",
    createDate: "20 Feb, 2023",
    dueDate: "26 Feb, 2023",
    priority: "low",
    status: "close",
  },
  {
    id: 6,
    assignedTo: [
      {
        id: "avatar1",
        assigneeName: "Stefanie Cartwright",
        assigneeImg: Avatar1,
      },
      {
        id: "avatar8",
        assigneeName: "Twila Stark",
        assigneeImg: Avatar6,
      },
      {
        assigneeName: "Kyla O'Hara",
        assigneeImg: Avatar5,
        id: "avatar7",
      },
      {
        assigneeName: "Alexys Collier",
        assigneeImg: Avatar4,
        id: "avatar6",
      },
    ],
    ticketTitle: "Sending props as strings (instead of numbers)",
    clientName: "Ophelia Steuber",
    createDate: "06 Apr, 2023",
    dueDate: "12 Apr, 2023",
    priority: "high",
    status: "open",
  },
  {
    id: 7,
    assignedTo: [
      {
        assigneeName: "Alexys Collier",
        assigneeImg: Avatar4,
        id: "avatar6",
      },
      {
        id: "avatar8",
        assigneeName: "Twila Stark",
        assigneeImg: Avatar6,
      },
    ],
    ticketTitle: "Creating and using God components",
    clientName: "Nelson Schaden",
    createDate: "27 Feb, 2023",
    dueDate: "05 Mar, 2023",
    priority: "medium",
    status: "pending",
  },
  {
    id: 8,
    assignedTo: [
      {
        assigneeName: "Alexys Collier",
        assigneeImg: Avatar4,
        id: "avatar6",
      },
      {
        id: "avatar8",
        assigneeName: "Twila Stark",
        assigneeImg: Avatar6,
      },
      {
        assigneeName: "Bennett Rice",
        assigneeImg: Avatar7,
        id: "avatar9",
      },
    ],
    ticketTitle: "Forgetting that setState is asynchronous",
    clientName: "Zachary Stokes",
    createDate: "16 Mar, 2023",
    dueDate: "05 Mar, 2023",
    priority: "medium",
    status: "close",
  },
  {
    id: 9,
    assignedTo: [
      {
        assigneeName: "Alexys Collier",
        assigneeImg: Avatar4,
        id: "avatar6",
      },
      {
        id: "avatar5",
        assigneeName: "Merlin Heaney",
        assigneeImg: Avatar3,
      },
    ],
    ticketTitle: "Modifying the state directly",
    clientName: "Lloyd Vanburen",
    createDate: "21 Mar, 2023",
    dueDate: "26 Mar, 2023",
    priority: "low",
    status: "new",
  },
  {
    id: 10,
    assignedTo: [
      {
        id: "avatar1",
        assigneeName: "Stefanie Cartwright",
        assigneeImg: Avatar1,
      },
    ],
    ticketTitle: "Not creating enough components",
    clientName: "Janet Guin",
    createDate: "28 Mar, 2023",
    dueDate: "06 Apr, 2023",
    priority: "high",
    status: "open",
  },
  {
    id: 11,
    assignedTo: [
      {
        assigneeName: "Alexys Collier",
        assigneeImg: Avatar4,
        id: "avatar6",
      },
      {
        id: "avatar8",
        assigneeName: "Twila Stark",
        assigneeImg: Avatar6,
      },
    ],
    ticketTitle: "Creating and using God components",
    clientName: "Nelson Schaden",
    createDate: "27 Feb, 2023",
    dueDate: "05 Mar, 2023",
    priority: "medium",
    status: "pending",
  },
];

export const priorityOption: MenuSelectItemType[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const statusOption = [
  { value: "", label: "Select Status" },
  { value: "open", label: "Open" },
  { value: "new", label: "New" },
  { value: "pending", label: "Pending" },
  { value: "close", label: "Close" },
];

export const avatars: AssigneeImgType[] = [
  {
    id: "avatar1",
    assigneeImg: Avatar1,
    assigneeName: "Stefanie Cartwright",
  },
  {
    id: "avatar2",
    assigneeImg: Avatar2,
    assigneeName: "Marisol Gaylord",
  },
  {
    id: "avatar3",
    assigneeImg: Avatar1,
    assigneeName: "Stefanie Cartwright",
  },
  {
    id: "avatar4",
    assigneeImg: Avatar2,
    assigneeName: "Marisol Gaylord",
  },
  {
    id: "avatar5",
    assigneeImg: Avatar3,
    assigneeName: "Merlin Heaney",
  },
  {
    id: "avatar6",
    assigneeImg: Avatar4,
    assigneeName: "Alexys Collier",
  },
  {
    id: "avatar7",
    assigneeImg: Avatar5,
    assigneeName: "Kyla O'Hara",
  },
  {
    id: "avatar8",
    assigneeImg: Avatar6,
    assigneeName: "Twila Stark",
  },
  {
    id: "avatar9",
    assigneeImg: Avatar7,
    assigneeName: "Bennett Rice",
  },
  {
    id: "avatar10",
    assigneeImg: Avatar8,
    assigneeName: "Dusty Hackett",
  },
  {
    id: "avatar11",
    assigneeImg: Avatar9,
    assigneeName: "Ines Stracke",
  },
  {
    id: "avatar12",
    assigneeImg: Avatar10,
    assigneeName: "Abner Wisozk",
  },
  {
    id: "avatar13",
    assigneeImg: Avatar10,
    assigneeName: "Abner Wisozk",
  },
];
