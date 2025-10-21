export type FilterType = {
  query: string;
  category: string;
  price: number[];
  color: string;
  brands: string[];
  discounts: string[];
};

export type ProductGridType = {
  id: number;
  img: string;
  img_alt: string;
  title: string;
  category: string;
  stock: string;
  price: string;
  discount: number;
  orders: string;
  ratings: string;
  publish: string;
};

export type CategoryType = { title: string; count?: number };
