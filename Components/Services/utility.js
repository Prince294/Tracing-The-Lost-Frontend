import axios from "axios";

const http = axios.create({
    // baseURL: "http://192.168.137.1:8000/",
    // baseURL: "http://10.100.2.65:8000/",
    baseURL: "http://192.168.93.216:8000/",

});

export default http;