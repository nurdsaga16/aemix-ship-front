import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://54.87.156.123/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
