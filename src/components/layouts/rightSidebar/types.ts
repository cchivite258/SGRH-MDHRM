export type ComponentPropertyType = {
  width?: string;
  topBar?: string;
  type?: string;
  sideBarColor?: string;
};
export type RightSideBarOptionsType = {
  title: string;
  subtitle: string;
  value: string;
  components?: {
    path: any;
    title: string;
    value: string;
    property?: ComponentPropertyType;
  }[];
  tabs?: {
    title: string;
    value: string;
  }[];
  images?: { path: string; title: string; isBrand?: boolean; value: string }[];
  sideBarImages?: {
    src: string;
    value: string;
  }[];
};
