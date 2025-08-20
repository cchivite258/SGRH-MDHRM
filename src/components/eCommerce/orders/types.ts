export type OrdersType = {
  id: string | number;
  order_date: string | Date;
  delivery_date: string | Date;
  product: string;
  customer: string;
  img: string | any;
  name: string;
  pay_method: string;
  price: string;
  ratings: string;
  delivery_status: string;
  isChecked?: boolean;
};
