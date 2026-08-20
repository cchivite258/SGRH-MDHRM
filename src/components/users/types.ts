export type UserInsertType= {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  requiredChangePassword: boolean;
  password?: string;
  password_confirm?: string;
};

export type UserListingType  = {
  id: number;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  username?: string;
  enabled: boolean;
  accountLocked: boolean;
  twoFactor: boolean;
  failedsLogin: string | number;
  lastSucessfulLogin: string | Date;
  lastFailedLogin: string | Date;
  lastPasswordUpdate: string | Date;
  passwordExpirationDate: string | Date;
  requiredChangePassword: boolean;
};


export type UserUpdateType = {
  firstName?: string;
  lastName?: string;
  email?: string;
  requiredChangePassword?: boolean;
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
}

export type changePasswordListingType = {
  id: number;
  newPassword: string;
  confirmPassword: string;
}


export type updatePasswordListingType = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;

}

export type updatePasswordResponseType = {
  message: string; 
  status: string;
  meta:{
    timestamp: string;
  }
}
