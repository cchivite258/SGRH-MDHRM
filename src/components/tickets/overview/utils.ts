import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { Avatar6, Avatar8, Avatar10 } from "@/assets/images/users/utils";
import { Img4, Img5 } from "@/assets/images/small/utils";
import { MessageType } from "@/components/tickets/overview/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "support-tickets",
    disabled: false,
  },
  {
    title: "overview",
    disabled: true,
  },
];

export const uiIdeas = [
  "App Registry Error in React",
  "Development Server Error in React",
  "Undefined is not an object error in React",
  "Not following the ReactJS folder structure",
  "Webstorm does not recognize tags",
];

export const chats: MessageType[] = [
  {
    src: Avatar8,
    name: "Joseph Parker",
    time: "20 Dec 2023 - 05:47AM",
    message: ` <p class="text-muted">I am getting message from customers that when they place order
      always get error message .</p>`,
    replies: [
      {
        src: Avatar10,
        name: "Alexis Clarke",
        time: "22 Dec 2023 - 02:32PM",
        message: `<p class="text-muted">Please be sure to check your Spam mailbox to see if your
         email filters have identified the email from Dell as spam.</p>`,
      },
    ],
  },
  {
    src: Avatar6,
    name: "Donald Palmer",
    time: "24 Dec 2023 - 05:20PM",
    message: `<p class="text-muted">If you have further questions, please contact Customer Support
    from the “Action Menu” on your <span
        class="text-primary text-decoration-underline">Online Order Support</span>.</p>`,
  },
  {
    src: Avatar10,
    name: "Alexis Clarke",
    time: "26 min ago",
    message: `<span class="text-primary text-decoration-underline">Online
      Order Support</span> provides you with the
  most current status of your order. To help manage your order refer to the “Action
  Menu” to initiate return, contact Customer Support and more.</p>`,
    images: [Img4, Img5],
  },
  {
    src: Avatar6,
    name: "Donald Palmer",
    time: "8 sec ago",
    message: `<p class="text-muted">Other shipping methods are available at checkout if you
    want your purchase delivered faster.</p>`,
  },
];
