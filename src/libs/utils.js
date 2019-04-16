import axios from 'axios';

let util = {};

util.ajax = axios.create({
   baseURL: 'http://localhost:8805/opcda',
   timeout: 3000
});

export default util;