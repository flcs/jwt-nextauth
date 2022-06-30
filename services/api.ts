import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";

let cookies = parseCookies();
export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies["nextauth.token"]}`,
  },
});
api.interceptors.response.use(
  (response) => response,
  (error: any) => {
    if (error.response?.status == 401) {
      if (error?.response.data?.code == "token.expired") {
        cookies = parseCookies();

        const { "nextauth.refreshToken": refreshToken } = cookies;

        api.post("/refresh", { refreshToken }).then((response) => {
          cookies = parseCookies();
          const { "nextauth.token": token } = cookies;
          setCookie(null, "nextauth.token", token, {
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
          });
          setCookie(null, "nextauth.refreshToken", response.data.refreshToken, {
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
          });
          api.defaults.headers.common.Authorization = token;
        });
      } else {
        //Logout
      }
    }
  }
);
