import axios from "axios";
//http://appbus.conexo.solutions:8990/api/v1
const server = axios.create({
    baseURL: "https://fastify-auth-api.onrender.com"
});


server.interceptors.request.use((response) => {
    return response;
}, (error) => {
    return Promise.reject(error);
})

export { server }