export type UserType = {
  username?: string;
  email: string;
  password: string;
};

export type UserType1 = { 
  id: number;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  username?: string;
  enabled: boolean;
  accountLocked: boolean;
  twoFactor: boolean;
  failedsLogin: string;
  lastSucessfulLogin: string | Date;
  lastFailedLogin: string | Date;
  lastPasswordUpdate: string | Date;
  passwordExpirationDate: string | Date;
};


export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: UserType;
};
