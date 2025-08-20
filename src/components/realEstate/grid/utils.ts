import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { FiltersType } from "@/components/realEstate/grid/types";
import { OptionType } from "@/app/common/types/option.type";
import { MenuSelectItemType } from "@/app/common/components/filters/types";

export const breadcrumb: BreadcrumbType[] = [
  {
    title: "real-estate",
    disabled: false,
  },
  {
    title: "listing-grid",
    disabled: true,
  },
];

export const filters: FiltersType = {
  location: "",
  propertyType: "All",
  bedroom: ["all"],
  price: [500, 3800],
  bathroom: ["all"],
  features: ["all"],
};

export const cardOptions: OptionType[] = [
  {
    title: "Edit",
    value: "edit",
    icon: "ph-pencil ph-lg",
  },
  {
    title: "Delete",
    value: "delete",
    icon: "ph-trash ph-lg",
  },
];

export const locationsOptions: MenuSelectItemType[] = [
  { value: "", label: "Select Location" },
  { value: "Australia", label: "Australia" },
  { value: "Belgium", label: "Belgium" },
  { value: "Brazil", label: "Brazil" },
  { value: "China", label: "China" },
  { value: "Denmark", label: "Denmark" },
  { value: "Greenland", label: "Greenland" },
  { value: "Jersey", label: "Jersey" },
  { value: "Mexico", label: "Mexico" },
  { value: "Saudi Arabia", label: "Saudi Arabia" },
  { value: "Serbia", label: "Serbia" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "United States", label: "United States" },
];

export const propertyTypes = [
  {
    label: "Villa",
    value: "Villa",
    icon: "ph-house",
  },
  {
    icon: "bx bx-buildings",
    value: "Residency",
    label: "Residency",
  },
  {
    label: "Apartment",
    value: "Apartment",
    icon: "bx bx-building",
  },
  {
    label: "All",
    value: "All",
    icon: "bx bx-home-alt",
  },
];

export const bedrooms = [
  { value: "all", label: "Select All" },
  { value: "2", label: "2 Bedroom" },
  { value: "3", label: "3 Bedroom" },
  { value: "4", label: "4 Bedroom" },
  { value: "5", label: "5 Bedroom" },
];

export const bathrooms = [
  { value: "all", title: "Select All" },
  { value: "2", title: "2 Bathroom" },
  { value: "3", title: "3 Bathroom" },
  { value: "4", title: "4 Bathroom" },
  { value: "5", title: "5 Bathroom" },
];

export const featureOptions = [
  { value: "all", title: "Select All" },
  { value: "Spa", title: "Spa" },
  { value: "Swimming Pool", title: "Swimming Pool" },
  { value: "Balcony", title: "Balcony" },
  { value: "Parking", title: "Parking" },
  { value: "Fitness Center", title: "Fitness Center" },
];

export const requirementOptions = [
  { value: "all", label: "Select All" },
  { value: "Rent", label: "Rent" },
  { value: "Sale", label: "Sale" },
];
