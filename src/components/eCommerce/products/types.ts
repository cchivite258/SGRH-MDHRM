export type FilterType = {
  query: string;
  brands: string[];
  category: string;
  discount: string;
};

export type ProductType = {
  id: number;
  img: string[] | null;
  img_alt: string;
  title: string;
  category: string;
  stock: string;
  price: string;
  discount: string;
  orders: string;
  ratings: string;
  publish: string;
  isChecked?: boolean;
};
