import axios from 'axios'

const MyHttpServer = {};

MyHttpServer.install = (Vue) => {
    axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';
    //请求拦截配置
    axios.interceptors.request.use(config => {
        config.headers.Authorization = window.sessionStorage.getItem('token');
        return config;
    });
    Vue.prototype.$http = axios;
};

export default MyHttpServer