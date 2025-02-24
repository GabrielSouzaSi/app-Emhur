import axios from "axios";
//http://appbus.conexo.solutions:8990/api/v1
const server = axios.create({
    baseURL: "https://emhur.conexo.solutions/api/v1"
});


server.interceptors.request.use((response) => {
    return response;
}, (error) => {
    return Promise.reject(error);
})

export { server }