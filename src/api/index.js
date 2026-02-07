import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://aemix-ship-back-1.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
