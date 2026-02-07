import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://api.webapi.codes/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
