import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import {
  Avatar1,
  Avatar2,
  Avatar3,
  Avatar4,
  Avatar5,
  Avatar6,
  Avatar8,
} from "@/assets/images/users/utils";
export const breadcrumb: BreadcrumbType[] = [
  {
    title: "vuetify-ui",
    disabled: false,
  },
  {
    title: "cards",
    disabled: true,
  },
];

export const gridMarkup = [
  {
    src: Avatar1,
    name: "Oliver Phillips",
    designation: "Digital Marketing",
    price: "$15,548",
    type: "Expense Account",
  },
  {
    src: Avatar4,
    name: "Natasha Carey",
    designation: "Manager",
    price: "$8,785",
    type: "Expense Account",
  },
  {
    src: Avatar3,
    name: "Bethany Johnson",
    designation: "Development",
    price: "$1,542",
    type: "Expense Account",
  },
  {
    src: Avatar5,
    name: "Erica Kernan",
    designation: "Fashion Designer",
    price: "$798",
    type: "Expense Account",
  },
  {
    src: Avatar6,
    name: "Lewis Pratt",
    designation: "Design",
    price: "$2,856",
    type: "Expense Account",
  },
];

export const alignment = [
  {
    icon: "ph-device-mobile-speaker ph-lg",
    title: "Text Application",
    btnText: "Apply Now",
    align: "left",
  },
  {
    icon: "ph-plus ph-lg",
    title: "Add New Application",
    btnText: "Add New",
    align: "center",
  },
  {
    icon: "ph-gift ph-lg",
    title: "Text Application",
    btnText: "Add New",
    align: "right",
  },
];

export const socialMedias = [
  {
    icon: "ph-facebook-logo",
    color: "secondary",
  },
  {
    icon: "ph-whatsapp-logo",
    color: "success",
  },
  {
    icon: "ph-linkedin-logo",
    color: "primary",
  },
  {
    icon: "ph-slack-logo",
    color: "danger",
  },
];

export const employeeCard = [
  {
    src: Avatar8,
    name: "Gabriel Palmer",
    post: "Graphic Designer",
  },
  {
    src: Avatar5,
    name: "Amelie Townsend",
    post: "Project Manager",
  },
  {
    src: Avatar3,
    name: "Jeffrey Montgomery",
    post: "UI/UX Designer",
  },
];

export const cardBackground = [
  {
    src: Avatar1,
    title: `<span class="font-weight-bold">Jeffrey Montgomery</span> (Graphic
      Designer) started a new conversation.`,
    color: "primary",
  },
  {
    src: Avatar2,
    title: `<span class="font-weight-bold">Charles Dickens</span> (Financial
      Analyst) started a new conversation.`,
    color: "success",
  },
  {
    src: Avatar3,
    title: `<span class="font-weight-bold">Oliver Phillips</span> (UI/UX Designer)
    started a new conversation.`,
    color: "info",
  },
  {
    src: Avatar4,
    title: `<span class="font-weight-bold">Rebecca Swartz</span> (Graphic Designer)
    started a new conversation.`,
    color: "warning",
  },
  {
    src: Avatar6,
    title: `<span class="font-weight-bold">Betty Richards</span> (Back End Developer)
    started a new conversation.`,
    color: "danger",
  },
  {
    src: Avatar5,
    title: `<span class="font-weight-bold">Brooke Hayes</span> (Founder & CEO) started a
    new conversation.`,
    color: "secondary",
  },
];

export const borderedCard = [
  {
    color: "primary",
    title: "Handle to Forecast",
    percent: "75%",
    detail: `Whether article spirits new her covered hastily sitting her. Money
    witty books nor son add build on the card Chicken age had evening believe but proceed
    pretend mrs.`,
    tag: "Poor",
    tagColor: "danger",
  },
  {
    color: "success",
    title: "Quality Forecast",
    percent: "100%",
    detail: `They all have something to say beyond the words on the page. They can
    come across as casual or neutral, exotic or graphic. Cosby sweater eu banh mi, qui irure
    terry richardson ex squid`,
    tag: "Excellent",
    tagColor: "success",
  },
  {
    color: "info",
    title: "Check your E-mails",
    detail: `They all have something to say beyond the words on the page. They can
    come across as casual or neutral, exotic or graphic. Cosby sweater eu banh mi, qui irure
    terry richardson ex squid.`,
    tag: "In Process",
    tagColor: "info",
  },
  {
    color: "warning",
    title: "Check your Payment",
    detail: `They all have something to say beyond the words on the page. They can come
    across as casual or neutral, exotic or graphic. Cosby sweater eu banh mi, qui irure terry
    richardson ex squid.`,
    tag: "Pending",
    tagColor: "warning",
  },
  {
    color: "danger",
    title: "Your Ordered Cancel",
    detail: `They all have something to say beyond the words on the page. They can come
    across as casual or neutral, exotic or graphic. Cosby sweater eu banh mi, qui irure terry
    richardson ex squid.`,
    tag: "Cancel",
    tagColor: "danger",
  },
  {
    color: "secondary",
    title: "Handle to Forecast",
    detail: `They all have something to say beyond the words on the page. They can come
    across as casual or neutral, exotic or graphic. Cosby sweater eu banh mi, qui irure terry
    richardson ex squid.`,
    tagColor: "secondary",
  },
];
