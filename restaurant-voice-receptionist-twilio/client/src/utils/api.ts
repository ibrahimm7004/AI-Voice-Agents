import { toast } from "react-toastify";
import { store } from "../store/store";
import { logOut } from "../store/authSlice";

const API_URL = import.meta.env.VITE_BACKEND_URL;

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

const fetchData = async (
  route: string,
  method: HttpMethod = "GET",
  body?: object
) => {
  try {
    console.log(`Calling ${method}:${route}`);

    const token = store.getState().auth.currentUser?.accessToken;

    const response = await fetch(`${API_URL}/${route}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? token : "",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    console.log(
      `Call ${method}:${route} finished with status ${response.status}`
    );

    if (!response.ok) {
      if (response.status === 401) {
        await store.dispatch(logOut()).unwrap();
        toast.error("Session expired, please log in again");
        return { data: null, response };
      }
      const error = await response.json();
      throw new Error(error.message || "An error occurred while fetching data");
    }
    let data;
    if (route == "questions/preview") {
      data = await response.blob();
    } else {
      data = await response.json();
    }

    return { data, response };
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};

const api = {
  get: (route: string) => fetchData(route, "GET"),
  patch: (route: string, body?: object) => fetchData(route, "PATCH", body),
  post: (route: string, body?: object) => fetchData(route, "POST", body),
  put: (route: string, body?: object) => fetchData(route, "PUT", body),
  delete: (route: string) => fetchData(route, "DELETE"),
};

export default api;
