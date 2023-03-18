import axios from "axios";

const http = axios.create({
    // baseURL: "http://192.168.137.1:8000/",
    baseURL: "http://192.168.34.216:8000/",
    // baseURL: "http://192.168.80.216:8000/",

});

export default http;