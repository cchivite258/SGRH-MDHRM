import {
  dropbox,
  GoogleDrive,
  CloudComputing,
} from "@/assets/images/brands/utils";
import { OptionType } from "@/app/common/types/option.type";

export const fileManageOptions = [
  {
    title: "All Folder",
    icon: "ph-folder",
    value: "all",
  },
  {
    title: "Documents",
    icon: "ph-file-text",
    value: "documents",
  },
  {
    title: "Media",
    icon: "ph-file-image",
    value: "media",
  },
  {
    title: "Recent File",
    icon: "ph-clock",
    value: "recent",
  },
  {
    title: "Important",
    icon: "ph-star",
    value: "important",
  },
];

export const topFolders = [
  {
    value: 345,
    type: "Files",
    color: "primary",
    icon: "ph-lg ph-file-text",
  },
  {
    value: 3124,
    type: "Images",
    color: "danger",
    icon: "ph-lg ph-file-image",
  },
  {
    value: 213,
    type: "Video",
    color: "secondary",
    icon: "ph-lg ph-video-camera",
  },
  {
    value: 469,
    type: "Docs Files",
    color: "warning",
    icon: "ph-lg ph-file-doc",
  },
  {
    value: 18,
    type: "Application",
    color: "success",
    icon: "ph-lg ph-google-play-logo",
  },
];

export const stores = [
  {
    title: "Dropbox",
    img: dropbox,
    color: "danger",
    totalSize: "14.57",
    currentSize: "1,324",
    size: 93,
  },
  {
    title: "Google Drive",
    img: GoogleDrive,
    color: "primary",
    totalSize: "30.45",
    currentSize: "3451",
    size: 74,
  },
  {
    title: "Cloud Storage",
    img: CloudComputing,
    color: "secondary",
    totalSize: "29.57",
    currentSize: "2416",
    size: 20,
  },
];

export const foldersHeadingOptions: OptionType[] = [
  {
    title: "Add folder",
    icon: "ph-folder-plus",
    value: "add",
  },
  {
    title: "Import",
    icon: "ph-download-simple",
    value: "import",
  },
  {
    title: "Export",
    icon: "ph-export",
    value: "export",
  },
];

export const folders = [
  {
    title: "My Documents",
    date: "24",
    month: "Feb",
    files: 733,
    size: 1.4,
    sizeType: "GB",
  },
  {
    title: "Steex - Admin & Dashboard Templates",
    date: "08",
    month: "Feb",
    files: 2473,
    size: 1.6,
    sizeType: "GB",
  },
  {
    title: "Database",
    date: "16",
    month: "March",
    files: 269,
    size: 716,
    sizeType: "MB",
  },
];

export const foldersOptions: OptionType[] = [
  {
    title: "Open folder",
    icon: "ph-folder-notch-open",
    value: "open",
  },
  {
    title: "Edit",
    icon: "ph-pencil",
    value: "edit",
  },
  {
    title: "Delete",
    icon: "ph-trash",
    value: "delete",
  },
];

export const recentFileHeading = [
  { title: "", isCheck: true },
  { title: "Document Name" },
  { title: "File Item" },
  { title: "Size" },
  { title: "Last Modified" },
  { title: "Action" },
];

export const recentFileListing = [
  {
    color: "danger",
    name: "	_variables.scss",
    item: "01",
    size: 0.234,
    sizeType: "KB",
    date: "04/03/2023",
  },
  {
    color: "success",
    name: "Offline Pages.gif",
    item: "01",
    size: 0.987,
    sizeType: "MB",
    date: "11/12/2023",
  },
  {
    color: "warning",
    name: "Velzon Docs Video.mp4",
    item: "19",
    size: 149.33,
    sizeType: "MB",
    date: "11/12/2023",
  },
  {
    color: "error",
    name: "	Velzon Docs File",
    item: "24",
    size: 2.5,
    sizeType: "MB",
    date: "02/15/2023",
  },
  {
    color: "secondary",
    name: "home Pattern Wave.svg",
    item: "01",
    size: 3.87,
    sizeType: "MB",
    date: "12/19/2022",
  },
  {
    color: "primary",
    name: "Steex Design Kit.psd",
    item: "148",
    size: 234.87,
    sizeType: "MB",
    date: "01/29/2023",
  },
];

export const recentFileOptions: OptionType[] = [
  {
    title: "View",
    icon: "ph-eye",
    value: "view",
  },
  {
    title: "Edit",
    icon: "ph-pencil",
    value: "edit",
  },
  {
    title: "Delete",
    icon: "ph-trash",
    value: "delete",
  },
];

export const storageDetailsChart = {
  series: [44, 55, 41, 17, 15],
  chartOptions: {
    labels: ["Document", "Audio", "Image", "Video", "Others"],
    chart: {
      type: "donut",
      width: 200,
      height: 350,
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: "gradient",
      width: "20px",
    },
    legend: {
      position: "bottom",
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  },
};

export const pinedItems = [
  {
    name: "Skote Design file.psd",
    size: "2.5 MB",
  },
  {
    name: "Trip Photography",
    size: "276 MB",
  },
  {
    name: "Steex Admin",
    size: "631 MB",
  },
  {
    name: "Velzon Design file",
    size: "1.3 GB",
  },
  {
    name: "Velzon React",
    size: "698 MB",
  },
  {
    name: "Steex Docs",
    size: "32.19 MB",
  },
  {
    name: "Skote Design file.psd",
    size: "2.5 MB",
  },
];
