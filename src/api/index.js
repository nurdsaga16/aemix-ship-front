import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://192.168.0.116:8080/api',
  headers: {
    // 'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
