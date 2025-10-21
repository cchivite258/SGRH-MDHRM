export type UserInsertType= {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  password_confirm?: string;
};

export type UserListingType  = {
  id: number;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  enabled: boolean;
  accountLocked: boolean;
  twoFactor: boolean;
  failedsLogin: string;
  lastSucessfulLogin: string | Date;
  lastFailedLogin: string | Date;
  lastPasswordUpdate: string | Date;
  passwordExpirationDate: string | Date;
};


export type UserUpdateType = {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export type OptionType = {
  title: string;
  value: string;
  icon?: string;
  to?: string;
};

export type changePasswordType = {
  newPassword: string;
  confirmPassword: string;
  passwordsMatching: boolean;
}

export type changePasswordListingType = {
  id: number;
  newPassword: string;
  confirmPassword: string;
  passwordsMatching: boolean;
}


export type updatePasswordListingType = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordsMatching: boolean;

}

export type updatePasswordResponseType = {
  message: string; 
  status: string;
  meta:{
    timestamp: string;
  }
}
