import axios from "axios";

const server = axios.create({
    baseURL: "http://appbus.conexo.solutions:8990/api/v1"
});


server.interceptors.request.use((response) => {
    return response;
}, (error) => {
    return Promise.reject(error);
})

export { server }