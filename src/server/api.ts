import axios from "axios";

const api = axios.create({
    baseURL: "http://192.168.100.169:3333"
});

api.interceptors.request.use((response) => {
    return response;
}, (error) => {
    return Promise.reject(error);
})

export { api }