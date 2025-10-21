const { VITE_APP_DEFAULT_AUTH, VITE_BASE_URL } = import.meta.env;

const appConfigs = {
  auth: VITE_APP_DEFAULT_AUTH,
  baseUrl: VITE_BASE_URL,
  googleMapAPIKey: "AIzaSyAbvyBxmMbFhrzP9Z8moyYr6dCr-pzjhBE"
};

export default appConfigs;
