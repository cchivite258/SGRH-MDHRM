import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { OptionType } from "@/app/common/types/option.type";
import {
  Avatar3,
  Avatar6,
  Avatar1,
  Avatar2,
  Avatar4,
  Avatar5,
  Avatar8,
} from "@/assets/images/users/utils";
import { ProjectType } from "@/components/pages/profile/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "pages",
    disabled: false,
  },
  {
    title: "profile",
    disabled: true,
  },
];

export const menuOptions: OptionType[] = [
  {
    title: "Facebook",
    icon: "bx bxl-facebook-circle ",
    value: "facebook",
  },
  {
    title: "Whatsapp",
    icon: "bx bxl-whatsapp",
    value: "whatsapp",
  },
  {
    title: "Instagram",
    icon: "bx bxl-instagram ",
    value: "instagram",
  },
];

export const information = [
  {
    title: "Designation",
    value: "Web Developer",
  },
  {
    title: "Phone No",
    value: "617 219 6245",
  },
  {
    title: "Date Of Birth",
    value: "24 June, 1998",
  },
  {
    title: "Website",
    value: "www.themesbrand.com",
    isLink: true,
  },
  {
    title: "Email",
    value: "richardmarshall@steex.com",
  },
  {
    title: "Location",
    value: "Los Angeles, California",
  },
  {
    title: "Joining Date",
    value: "30 Oct 2023",
  },
];

export const socialMedias = [
  {
    color: "secondary",
    icon: "bx bxl-github",
  },
  {
    color: "primary",
    icon: "bx bxl-facebook-circle",
  },
  {
    color: "success",
    icon: "bx bxl-dribbble",
  },
  {
    color: "danger",
    icon: "bx bxl-instagram",
  },
];

export const documents = [
  {
    icon: "ph-file-zip",
    title: "Artboard.zip",
    size: "2.02MB",
  },
  {
    icon: "ph-article",
    title: "steex.txt",
    size: "1.49MB",
  },
  {
    icon: "ph-file-image",
    title: "Progile bg.png",
    size: "325kb",
  },
  {
    icon: "ph-file-pdf",
    title: "Steex Docs.pdf",
    size: "2.06MB",
  },
];
export const recentFollowers = [
  {
    title: "Esther James",
    designation: "Web Designer",
    src: Avatar3,
    isFollowed: true,
  },
  {
    title: "Jacqueline Steve",
    designation: "UI/UX Designer",
    src: Avatar6,
    isFollowed: false,
  },
  {
    title: "George Whalen",
    designation: "Backend Developer",
    src: Avatar2,
    isFollowed: false,
  },
];

export const tabs = [
  { title: "Overview", value: "overview" },
  { title: "Activities", value: "activities" },
  { title: "Projects", value: "projects" },
  { title: "Friends", value: "friends" },
];

export const qualifications = [
  {
    title: "Masters in Computer Application (MCA)",
    date: "2023 - Continue",
    university: "California State University",
    description:
      "It is a 3-year post-graduate course. To pursue MCA, you must be a graduate from a well-known university after completing 10+2 with Mathematics as a subject to apply for this course.",
  },
  {
    title: "Bachelors's in Computer Application (BCA)",
    date: "2018 - 2023",
    university: "California State University",
    description:
      "BCA is a three-year degree course for people who wish to dive into the world of programming language.",
  },
];

export const projects: ProjectType[] = [
  {
    tag: "web Design",
    tagColor: "warning",
    title: "Chat App Update",
    lastUpdate: "2 year Ago",
    progress: 80,
    progressColor: "primary",
    share: 4,
    chat: 3,
    avatars: [{ src: Avatar1 }, { src: Avatar3 }, "J"],
  },
  {
    tag: "web Design",
    tagColor: "warning",
    title: "ABC Project Customization",
    lastUpdate: "2 month Ago",
    progress: 65,
    progressColor: "warning",
    share: 25,
    chat: 146,
    avatars: [{ src: Avatar2 }, { src: Avatar4 }, { src: Avatar1 }],
  },
  {
    tag: "Dashboard",
    tagColor: "secondary",
    title: "Client - Frank Hook",
    lastUpdate: "1 year Ago",
    progress: 23,
    progressColor: "danger",
    share: 8,
    chat: 98,
    avatars: ["M", { src: Avatar1 }, { src: Avatar3 }],
  },
  {
    tag: "App Development",
    tagColor: "success",
    title: "Steex Project",
    lastUpdate: "11 year Ago",
    progress: 100,
    progressColor: "success",
    share: 12,
    chat: 36,
    avatars: [{ src: Avatar2 }, { src: Avatar5 }],
  },
  {
    tag: "Landing Page",
    tagColor: "secondary",
    title: "Brand Logo Design",
    lastUpdate: "10 min Ago",
    progress: 68,
    progressColor: "primary",
    share: 13,
    chat: 62,
    avatars: [{ src: Avatar1 }, { src: Avatar3 }, "E"],
  },
  {
    tag: "Web Development",
    tagColor: "info",
    title: "Chat App",
    lastUpdate: "8 hr Ago",
    progress: 76,
    progressColor: "info",
    share: 36,
    chat: 195,
    avatars: [{ src: Avatar1 }, "R", { src: Avatar3 }],
  },
  {
    tag: "Mobile App",
    tagColor: "warning",
    title: "Project Update",
    lastUpdate: "48 min Ago",
    progress: 69,
    progressColor: "info",
    share: 87,
    chat: 249,
    avatars: [{ src: Avatar6 }, { src: Avatar2 }, { src: Avatar5 }],
  },
  {
    tag: "Web Design",
    tagColor: "danger",
    title: "Bsuiness Template - UI/UX design",
    lastUpdate: "7 month Ago",
    progress: 10,
    progressColor: "danger",
    share: 130,
    chat: 341,
    avatars: [{ src: Avatar6 }, { src: Avatar8 }, "R", { src: Avatar3 }],
  },
  {
    tag: "Web Design",
    tagColor: "danger",
    title: "Bsuiness Template - UI/UX design",
    lastUpdate: "7 month Ago",
    progress: 100,
    progressColor: "success",
    share: 130,
    chat: 341,
    avatars: [{ src: Avatar6 }, { src: Avatar8 }, "R", { src: Avatar3 }],
  },
];

export const cardOptions: OptionType[] = [
  {
    title: "Edit",
    value: "edit",
    icon: "ph-pencil",
  },
  {
    title: "Remove",
    value: "remove",
    icon: "ph-trash",
  },
];
