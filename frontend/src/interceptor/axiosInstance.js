import axios from "axios";
import { Mutex } from 'async-mutex'

let refresh = false;
const apiUrl = process.env.REACT_APP_API_URL;

let axiosInstance = axios.create({
  baseURL: `${apiUrl}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const mutex = new Mutex()

axiosInstance.interceptors.response.use(resp => resp, async error => {
  return await mutex.runExclusive(async () => {
    if (error.response.status === 401 && !refresh) {
      refresh = true;
      const response = await axiosInstance.post(`${apiUrl}/token/refresh/`,
        { refresh: localStorage.getItem('refresh_token') },
        { headers: { 'Content-Type': 'application/json' } },
        { withCredentials: true }
      );
      // TODO
      // returneaza {"detail":"Token is blacklisted","code":"token_not_valid"}
      // cel mai probabil race condition: doua request-uri dau fail simultan, fac refresh la token simultan si unul ajunge invalid
      /*
        refresh1
        T1                              T2
        request da fail                 request da fail
  
        refresh token 
         cu refresh1 -> refresh2       
  
                                        refresh token cu refresh1 -> refresh3 
                                         dar refresh1 este deja invalid!!!
      */
      if (response.status === 200) {
        var prevRequest = error.config;
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        prevRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        return axiosInstance(prevRequest);
      }
    }
    refresh = false;
    return Promise.reject(error);
  })
});

export default axiosInstance;