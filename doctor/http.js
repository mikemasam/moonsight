import axios from 'axios';

axios.interceptors.request.use(function (config) {
  // Do something before request is sent
  return config;
}, function (error) {
    // Do something with request error
    return {
      status: 400,
      data: null,
      message: "Request failed before starting..",
      error
    }
  });

axios.interceptors.response.use(function (response) {
  return response;
}, function (error) {
    return {
      status: 400,
      data: null,
      message: "Invalid response data..",
      error
    }
  });

export default async function creator(kernel){
  return axios.create({
    baseURL: `http://${kernel.opts.host}`,
    timeout: 50000,
    headers: {'MACHINE-ENV': 'LOCAL-TEST'},
    validateStatus: function (status) {
      return true; 
    },
  });
}
