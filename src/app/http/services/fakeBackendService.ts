import { UserType } from "@/app/http/types";
import LocalStorage from "@/app/localStorage";
import { LS_KEY_USER, LS_KEY_USERS } from "@/app/const";

const usersLocalStorage = new LocalStorage(LS_KEY_USERS);
const userLocalStorage = new LocalStorage(LS_KEY_USER);
export default class FakeBackendService {
  users: UserType[];
  constructor() {
    const users = usersLocalStorage.getItems();
    if (users.length) {
      this.users = users;
    } else {
      this.users = [
        {
          username: "admin",
          email: "admin@themesbrand.com",
          password: "admin",
        },
      ];
      usersLocalStorage.setItems(this.users);
    }
  }

  getUser() {
    return userLocalStorage.getItems();
  }

  async login(payload: UserType) {
    const { username, email, password } = payload;
    const userData = this.users.find((user) => {
      return user.username === username && user.password === password;
    });
    if (userData) {
      const preparedData = {
        ...userData,
        token: "fake-token",
      };
      userLocalStorage.setItems(preparedData);
      return preparedData;
    } else {
      throw new Error("These credentials do not match our records.");
    }
  }

  resetPassword(email: string) {
    const userData = this.users.find((user) => {
      return user.email === email;
    });

    if (userData) {
      return "Your new password change link has been emailed to you. Please check your inbox for further instructions";
    } else {
      throw new Error("These credentials do not match our records.");
    }
  }

  signUp(payload: UserType) {
    const { email, username } = payload;

    const isUserExist = this.users.find((user) => {
      return user.email === email || user.username === username;
    });

    if (isUserExist) {
      throw new Error("This record is already exists!");
    } else {
      this.users.push(payload);
      usersLocalStorage.setItems(this.users);
      return "User created successfully!";
    }
  }

  createPassword(payload: {
    username: string;
    password: string;
    confirmPassword: string;
  }) {
    const user = this.users.find((user) => {
      return user.username === payload.username;
    });
    if (!user) {
      throw new Error("These credentials do not match our records!");
    } else if (user.password === payload.password) {
      throw new Error(
        "Your new password must be different from previous used password!"
      );
    } else if (payload.password !== payload.confirmPassword) {
      throw new Error("Your new password and confirm password must be same!");
    } else {
      this.users = this.users.map((user) => {
        if (user.username === payload.username) {
          return {
            ...user,
            password: payload.password,
          };
        }
        return user;
      });
      usersLocalStorage.setItems(this.users);

      return "Password Create Successfully!";
    }
  }
}
