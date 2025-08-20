export type ProvinceListingType = {
    id: string | number;
    name: string;
    code: string;
    country: {
        id: string | number;
        name: string;
        code: string;
        iso2Code: string;
        iso3Code: string;
        phoneCode: string;
        currency: string;
        currencySymbol: string;
        currencyCode: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        deletedAt: Date | null;
        createdBy: string;
        updatedBy: string;
        deletedBy: string;
      },
      createdAt: Date | null;
      updatedAt: Date | null;
      deletedAt: Date | null;
      createdBy: string;
      updatedBy: string;
      deletedBy: string; 
      enabled: boolean;
  };