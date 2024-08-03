import axios from "axios";

export const api = axios.create({
    baseURL: "https://appbus.conexo.solutions/api/"
});