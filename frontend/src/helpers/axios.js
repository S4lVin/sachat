import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URL
if (!baseURL) {
  throw new Error("VITE_BACKEND_URL undefined, check .env")
}

export const api = axios.create({
  baseURL: `${baseURL}/api`,
  timeout: 5000
})
