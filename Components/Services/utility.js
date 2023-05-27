import axios from "axios";

const http = axios.create({
  // baseURL: "http://174.129.124.119:8000/",
  baseURL: "http://192.168.152.216:8000/",
});

export default http;
