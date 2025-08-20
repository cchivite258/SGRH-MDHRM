import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { MenuSelectItemType } from "@/app/common/components/filters/types";
import { CustomersType } from "@/components/eCommerce/customers/types";
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
  DummyUser,
} from "@/assets/images/users/utils";
import {
  Img1,
  Img2,
  Img3,
  Img4,
  Img5,
  Img6,
} from "@/assets/images/products/utils";
import { OptionType } from "@/app/common/types/option.type";

export const customersBreadcrumb: BreadcrumbType[] = [
  {
    title: "ecommerce",
    disabled: false,
  },
  {
    title: "customers",
    disabled: true,
  },
];

export const filters = {
  query: "",
  status: "",
  date: "",
};

export const statusOptions: MenuSelectItemType[] = [
  { value: "", label: "All Select" },
  { value: "active", label: "Active" },
  { value: "block", label: "Block" },
  { value: "unActive", label: "UnActive" },
];

export const customers: CustomersType[] = [
  {
    id: "1",
    img: Avatar2,
    name: "Javon Pouros",
    email: "rashawn@steex.com",
    phone: "+(253) 12345 67890",
    create_date: "28 Feb, 2023",
    status: "unActive",
  },
  {
    id: "2",
    img: Avatar3,
    name: "Willy Gulgowski",
    email: "gulgowski@steex.com",
    phone: "+(152) 32165 49873",
    create_date: "20 Feb, 2023",
    status: "block",
  },
  {
    id: "3",
    img: Avatar4,
    name: "Verona Mosciski",
    email: "vmosciski@steex.com",
    phone: "+(231) 14562 32165",
    create_date: "16 Feb, 2023",
    status: "active",
  },
  {
    id: "4",
    img: Avatar5,
    name: "Vinnie Huels",
    email: "vinnie@steex.com",
    phone: "+(44) 98765 32104",
    create_date: "23 Jan, 2023",
    status: "active",
  },
  {
    id: "5",
    img: Avatar6,
    name: "Deondre Huel",
    email: "rashawn@steex.com",
    phone: "+(251) 25874 13690",
    create_date: "17 Jan, 2023",
    status: "active",
  },
  {
    id: "6",
    img: Avatar7,
    name: "Nelson Schaden",
    email: "nelson@steex.com",
    phone: "+(92) 67890 12345",
    create_date: "02 Feb, 2023",
    status: "unActive",
  },
  {
    id: "7",
    img: Avatar8,
    name: "Juanita Price",
    email: "juanitaprice@steex.com",
    phone: "+(62) 35791 15935",
    create_date: "29 Dec, 2022",
    status: "block",
  },
  {
    id: "8",
    img: Avatar9,
    name: "Mac Gyver",
    email: "macGyver@steex.com",
    phone: "+(251) 15935 35795",
    create_date: "24 Dec, 2022",
    status: "active",
  },
  {
    id: "9",
    img: Avatar10,
    name: "Zachary Stokes",
    email: "zacharystokes@steex.com",
    phone: "+(532) 35795 15935",
    create_date: "14 Dec, 2022",
    status: "active",
  },
  {
    id: "10",
    img: DummyUser,
    name: "Sarai Schmidt",
    email: "sschmidt@steex.com",
    phone: "+(120) 15935 32165",
    create_date: "08 Dec, 2022",
    status: "block",
  },
  {
    id: "11",
    img: Avatar1,
    name: "Ubaldo Bartell",
    email: "ubaldobartell@steex.com",
    phone: "+(105) 93521 23165",
    create_date: "01 Dec, 2022",
    status: "unActive",
  },
  {
    id: "12",
    img: Avatar2,
    name: "Soledad Vandervort",
    email: "vandervort@steex.com",
    phone: "+(210) 95162 15935",
    create_date: "24 Nov, 2022",
    status: "active",
  },
  {
    id: "13",
    img: Avatar3,
    name: "Marcelino Smith",
    email: "marcelino@steex.com",
    phone: "+(512) 34682 17935",
    create_date: "21 Nov, 2022",
    status: "active",
  },
];

export const customersOptions: OptionType[] = [
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

export const socialMedia = [
  {
    icon: "ph-whatsapp-logo",
    color: "success",
  },
  {
    icon: "bx bxl-meta",
    color: "primary",
  },
  {
    icon: "bx bxl-github",
    color: "secondary",
  },
];

export const orders = [
  {
    src: Img1,
    title: "Craft Women Black Sling Bag",
    ratings: 487,
    cart: 936,
    price: 15.99,
  },
  {
    src: Img2,
    title: "Unique Men's Wrist Watch",
    ratings: 452,
    cart: 1420,
    price: 84.99,
  },
  {
    src: Img3,
    title: "Twiala Floral Dress",
    ratings: 562,
    cart: 562,
    price: 149.99,
  },
  {
    src: Img4,
    title: "Tokyo Fancy Bomber Jacket",
    ratings: 644,
    cart: 1540,
    price: 245.0,
  },
  {
    src: Img5,
    title: "Aster Dress 2XL / Royal Blue",
    ratings: 841,
    cart: 985,
    price: 74.63,
  },
  {
    src: Img6,
    title: "Craft Women Black Sling Bag",
    ratings: 763,
    cart: 763,
    price: 245.74,
  },
];
