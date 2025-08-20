export type ImageType = {
  id: number;
  src: string;
  formattedSize: string;
  path: string;
  size: string;
};

export type ProductReviewsType = {
  id: number;
  rating: string;
  name: string;
  date: string;
  title: string;
  desc: string;
  img?: ImageType[];
};
