import {
  Avatar1,
  Avatar2,
  Avatar3,
  Avatar4,
  Avatar5,
  Avatar6,
  Avatar7,
  Avatar8,
  Avatar10,
} from "@/assets/images/users/utils";
import { OptionType } from "@/app/common/types/option.type";
import { ChatContactDataType } from "@/components/chats/types";

export const chatHeaderOptions: OptionType[] = [
  {
    title: "Archive",
    icon: "ph-archive-box",
    value: "archive",
  },
  {
    title: "Muted",
    icon: "ph-microphone-slash",
    value: "muted",
  },
  {
    title: "Delete",
    icon: "ph-trash",
    value: "delete",
  },
];

export const chatMenuItems: { title: string; value: string; icon: string }[] = [
  {
    title: "Chats",
    value: "chat",
    icon: "ph-chat-circle-dots",
  },
  {
    title: "Contacts",
    value: "contact",
    icon: "ph-users",
  },
  {
    title: "Calls",
    value: "call",
    icon: "ph-phone",
  },
  {
    title: "Bookmark",
    value: "bookmark",
    icon: "ph-star",
  },
  {
    title: "Attachment",
    value: "attachment",
    icon: "ph-file-text",
  },
];

export const chatOption: OptionType[] = [
  {
    icon: "bx bx-reply",
    title: "Reply",
    value: "reply",
  },
  {
    icon: "bx bx-share-alt",
    title: "Forward",
    value: "forward",
  },
  {
    icon: "bx bx-copy",
    title: "Copy",
    value: "copy",
  },
  {
    icon: "bx bx-bookmark",
    title: "Bookmark",
    value: "bookmark",
  },
  {
    icon: "bx bx-trash",
    title: "Delete",
    value: "delete",
  },
];

export const chats = [
  {
    id: 1,
    roomId: 1,
    name: "Lisa Parker",
    src: Avatar2,
    status: "success",
    online: true,
  },
  {
    id: 2,
    roomId: 2,
    name: "Frank Thomas",
    src: Avatar3,
    channels: 8,
    online: true,
  },
  {
    id: 3,
    roomId: 3,
    name: "Clifford Taylor",
    profile: "CT",
    online: false,
  },
  {
    id: 4,
    roomId: 4,
    name: "Janette Caster",
    src: Avatar4,
    status: "success",
    online: true,
  },
  {
    id: 5,
    roomId: 5,
    name: "Sarah Beattie",
    src: Avatar5,
    channels: 5,
    online: true,
  },
  {
    id: 6,
    roomId: 6,
    name: "Nellie Cornett",
    src: Avatar6,
    channels: 2,
    online: false,
  },
  {
    id: 7,
    roomId: 7,
    name: "Chris Kiernan",
    profile: "CK",
    online: true,
  },
  {
    id: 8,
    roomId: 8,
    name: "Edith Evans",
    profile: "EE",
    online: false,
  },
  {
    id: 9,
    roomId: 9,
    name: "Joseph Siegel",
    src: Avatar7,
    online: false,
  },
];

export const channelsData = [
  {
    chat_id: 1,
    name: "Landing Design",
    channels: 7,
  },
  {
    chat_id: 2,
    name: "General",
  },
  {
    chat_id: 3,
    name: "Project Tasks",
    channels: 2,
  },
  {
    chat_id: 4,
    name: "Meeting",
  },
  {
    chat_id: 5,
    name: "Reporting",
  },
];

export const messages = [
  {
    id: 1,
    roomId: 1,
    sender: "Lisa Parker",
    message: [
      {
        msg_id: 1,
        msg: "Good morning 😊",
        createdAt: "09:07 am",
      },
    ],
  },
  {
    id: 2,
    roomId: 1,
    sender: "Anna Adame",
    align: "right",
    message: [
      {
        msg_id: 2,
        msg: "Good morning, How are you? What about our next meeting?",
        createdAt: "09:08 am",
      },
    ],
  },
  {
    id: 3,
    roomId: 1,
    sender: "Lisa Parker",
    message: [
      {
        msg_id: 3,
        msg: "Yeah everything is fine. Our next meeting tomorrow at 10.00 AM",
        createdAt: "09:10 am",
      },
      {
        msg_id: 4,
        msg: "Hey, I'm going to meet a friend of mine at the department store. I have to buy some presents for my parents 🎁.",
        createdAt: "09:11 am",
      },
    ],
  },
  {
    id: 4,
    roomId: 1,
    sender: "Anna Adame",
    align: "right",
    message: [
      {
        msg_id: 5,
        msg: "Wow that's great",
        createdAt: "09:12 am",
      },
    ],
  },
];

export const channelMessage = [
  {
    id: 1,
    roomId: 1,
    sender: "Lisa Parker",
    message: [
      {
        msg_id: 1,
        msg: "Good morning Everyone",
        createdAt: "10:07 am",
      },
    ],
    image: Avatar2,
  },
  {
    id: 2,
    roomId: 1,
    sender: "Anna Adame",
    message: [
      {
        msg_id: 2,
        msg: "Good morning, How are you? What about our next meeting?",
        createdAt: "09:08 am",
      },
    ],
    align: "right",
  },
  {
    id: 3,
    roomId: 1,
    sender: "Lisa Parker",
    message: [
      {
        msg_id: 3,
        msg: "Yeah everything is fine. Our next meeting tomorrow at 10.00 AM",
        createdAt: "10:13 am",
      },
      {
        msg_id: 4,
        msg: "Wow that's great",
        createdAt: "10:13 am",
      },
    ],
    image: Avatar3,
  },
  {
    id: 5,
    roomId: 1,
    sender: "Lisa Parker",
    message: [
      {
        msg_id: 5,
        msg: "@Jean Berwick, Please Assign AB-123 to me",
        createdAt: "10:14 am",
      },
    ],
    align: "right",
  },
  {
    id: 6,
    roomId: 1,
    sender: "Lisa Parker",
    message: [
      {
        msg_id: 6,
        msg: "Okay, Sure",
        createdAt: "10:15 am",
      },
    ],
    image: Avatar2,
  },
];

export const chatContactData: ChatContactDataType[] = [
  {
    title: "A",
    contacts: [
      {
        id: 1,
        name: "Alice Cruickshank",
        status: "offline",
        roomId: 5,
        profile: "AC",
      },
    ],
  },
  {
    title: "B",
    contacts: [
      {
        id: 1,
        name: "Barrett Brown",
        status: "offline",
        roomId: 1,
        src: Avatar4,
      },
    ],
  },
  {
    title: "C",
    contacts: [
      {
        id: 1,
        name: "Chris Kiernan",
        status: "offline",
        roomId: 3,
        profile: "CK",
      },
      {
        id: 2,
        name: "Clifford Taylor",
        status: "offline",
        roomId: 4,
        profile: "CT",
      },
    ],
  },
  {
    title: "E",
    contacts: [
      {
        id: 1,
        name: "Edith Evans",
        status: "offline",
        roomId: 5,
        profile: "EE",
      },
    ],
  },
  {
    title: "F",
    contacts: [
      {
        id: 1,
        name: "Frank Thomas",
        status: "offline",
        roomId: 6,
        src: Avatar3,
      },
    ],
  },
  {
    title: "G",
    contacts: [
      {
        id: 1,
        name: "Gilbert Beer",
        status: "offline",
        roomId: 7,
        profile: "GB",
      },
    ],
  },
  {
    title: "J",
    contacts: [
      {
        id: 1,
        name: "Janette Caster",
        status: "offline",
        roomId: 8,
        src: Avatar4,
      },
      {
        id: 2,
        name: "Joseph Siegel",
        status: "offline",
        roomId: 9,
        src: Avatar7,
      },
      {
        id: 3,
        name: "Justyn Wisoky",
        status: "offline",
        roomId: 2,
        src: Avatar1,
      },
    ],
  },
  {
    title: "K",
    contacts: [
      {
        id: 1,
        name: "Keaton King",
        status: "offline",
        roomId: 11,
        src: Avatar5,
      },
    ],
  },
  {
    title: "L",
    contacts: [
      {
        id: 1,
        name: "Lisa Parker",
        status: "offline",
        roomId: 1,
        src: Avatar2,
      },
    ],
  },
  {
    title: "M",
    contacts: [
      {
        id: 1,
        name: "Marian Moen",
        status: "offline",
        roomId: 3,
        profile: "MM",
      },
    ],
  },
  {
    title: "N",
    contacts: [
      {
        id: 1,
        name: "Nellie Cornett",
        status: "offline",
        roomId: 4,
        src: Avatar6,
      },
    ],
  },
  {
    title: "R",
    contacts: [
      {
        id: 1,
        name: "Ronald Downey",
        status: "offline",
        roomId: 5,
        profile: "RD",
      },
    ],
  },
  {
    title: "S",
    contacts: [
      {
        id: 1,
        name: "Sarah Beattie",
        status: "offline",
        roomId: 6,
        src: Avatar5,
      },
    ],
  },
  {
    title: "V",
    contacts: [
      {
        id: 1,
        name: "Victor Beahan",
        status: "offline",
        roomId: 7,
        src: Avatar10,
      },
    ],
  },
  {
    title: "W",
    contacts: [
      {
        id: 1,
        name: "Wayne Runte",
        status: "offline",
        roomId: 8,
        src: Avatar2,
      },
    ],
  },
];

export const contactOptions: OptionType[] = [
  {
    title: "Edit",
    value: "edit",
    icon: "ph-pencil",
  },
  {
    title: "Block",
    value: "block",
    icon: "ph-prohibit",
  },
  {
    title: "Remove",
    value: "remove",
    icon: "ph-trash",
  },
];

export const callsData = [
  {
    id: 1,
    name: "Warren Hickey",
    date: "22 Feb, 06:49PM",
    time: "01:10",
    icon: "ph-video-camera",
    isArrow: true,
    image: Avatar2,
  },
  {
    id: 2,
    name: "Angela Walls",
    date: "22 Feb, 03:23PM",
    time: "02:34",
    icon: "ph-video-camera",
    isImg: true,
    isArrow: true,
    profile: "AW",
  },
  {
    id: 3,
    name: "Thomas Lane",
    date: "22 Feb, 10:31AM",
    time: "01:40",
    icon: "ph-phone",
    isArrow: false,
    image: Avatar3,
  },
  {
    id: 4,
    name: "Elisa Smith",
    date: "21 Feb, 07:05PM",
    time: "03:51",
    icon: "ph-phone",
    isImg: true,
    isArrow: true,
    profile: "ES",
  },
  {
    id: 5,
    name: "Ola Black",
    date: "21 Feb, 05:15PM",
    time: "05:15",
    icon: "ph-video-camera",
    isImg: true,
    isArrow: false,
    profile: "OB",
  },
  {
    id: 6,
    name: "Victoria McBride",
    date: "21 Feb, 10:30AM",
    time: "00:42",
    icon: "ph-phone",
    isArrow: true,
    image: Avatar3,
  },
  {
    id: 7,
    name: "Carla Scott",
    date: "20 Feb, 05:20PM",
    time: "04:02",
    icon: "ph-video-camera",
    isArrow: true,
    image: Avatar5,
  },
  {
    id: 8,
    name: "Waldo Smith",
    date: "20 Feb, 01:40PM",
    time: "02:34",
    icon: "ph-video-camera",
    isArrow: false,
    isImg: true,
    profile: "WS",
  },
  {
    id: 9,
    name: "Mary Parker",
    date: "19 Feb, 11:29AM",
    time: "10:09",
    icon: "ph-phone",
    isArrow: false,
    image: Avatar6,
  },
  {
    id: 1,
    name: "Judith Morrow",
    date: "18 Feb, 02:05PM",
    time: "07:15",
    icon: "ph-phone",
    isArrow: true,
    image: Avatar8,
  },
];

export const bookmarkData = [
  {
    id: "1",
    icon: "ph-file-text",
    fileName: "design-phase-1-approved.pdf",
    size: "12.5 MB",
  },
  {
    id: "2",
    icon: "ph-push-pin",
    fileName: "Bg Pattern",
    size: "https://bgpattern.com/",
  },
  {
    id: "3",
    icon: "bx bx-image",
    fileName: "Image-001.jpg",
    size: "4.2 MB",
  },
  {
    id: "4",
    icon: "ph-push-pin",
    fileName: "Images",
    size: "https://images123.com/",
  },
  {
    id: "5",
    icon: "ph-push-pin",
    fileName: "Bg Gradient",
    size: "https://bggradient.com/",
  },
  {
    id: "6",
    icon: "bx bx-image",
    fileName: "Image-012.jpg",
    size: "3.1 MB",
  },
  {
    id: "7",
    icon: "ph-file-text",
    fileName: "analytics dashboard.zip",
    size: "6.7 MB",
  },
  {
    id: "8",
    icon: "bx bx-image",
    fileName: "Image-031.jpg",
    size: "4.2 MB",
  },
];

export const bookmarkOptions: OptionType[] = [
  {
    title: "Open",
    value: "open",
    icon: "ph-file ph-lg",
  },
  {
    title: "Edit",
    value: "edit",
    icon: "ph-pencil-line ph-lg",
  },
  {
    title: "Delete",
    value: "delete",
    icon: "ph-trash ph-lg",
  },
];

export const attachmentsData = [
  {
    id: 1,
    icon: "ph-file-text",
    foldername: "design-phase-1-approved.pdf",
    size: "12.5 MB",
  },
  {
    id: 2,
    icon: "bx bx-image",
    foldername: "Image-1.jpg",
    size: "4.2 MB",
  },
  {
    id: 3,
    icon: "bx bx-image",
    foldername: "Image-2.jpg",
    size: "3.1 MB",
  },
  {
    id: 4,
    icon: "ph-file-text",
    foldername: "Landing-A.zip",
    size: "6.7 MB",
  },
];

export const attachmentOptions: OptionType[] = [
  {
    title: "Share",
    value: "share",
    icon: "ph-share-network ph-lg",
  },
  {
    title: "Bookmark",
    value: "bookmark",
    icon: "ph-bookmarks ph-lg",
  },
  {
    title: "Delete",
    value: "delete",
    icon: "ph-trash ph-lg",
  },
];
