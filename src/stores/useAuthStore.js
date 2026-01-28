import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api/index'
import Cookies from 'universal-cookie'

export const useAuthStore = defineStore('auth', () => {
  const authData = ref(null)
  const cookies = new Cookies()

  function saveAuthData(data) {
    authData.value = data
    cookies.set('authData', data, { path: '/', secure: true, sameSite: 'Strict' })
  }

  function removeAuthData() {
    authData.value = null
    cookies.remove('authData', { path: '/' })
  }

  function readAuthData() {
    const storedAuthData = cookies.get('authData')
    if (storedAuthData) authData.value = storedAuthData
  }

  // Инициализируем authData из cookies при загрузке
  readAuthData()

  // Добавляем токен в каждый запрос, если он есть
  api.interceptors.request.use(
    (config) => {
      if (authData.value?.token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${authData.value.token}`
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  // Если бэк вернул 401/403 — чистим auth и уводим на /login
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status
      if (status === 401 || status === 403) {
        removeAuthData()
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
      return Promise.reject(error)
    },
  )

  async function login(emailOrTelegramId, password) {
    try {
      const token = (
        await api.post('/auth/login', { emailOrTelegramId, password })
      ).data.token
      saveAuthData({ token })
    } catch (err) {
      throw new Error('Ошибка входа')
    }
  }

  async function loginWithTelegram(telegramPayload) {
    try {
      const token = (await api.post('/auth/telegram', telegramPayload)).data.token
      saveAuthData({ token })
    } catch (err) {
      throw new Error('Ошибка входа через Telegram')
    }
  }

  async function register(emailOrTelegramId, password) {
    try {
      await api.post('/auth/register', { emailOrTelegramId, password })
    } catch (err) {
      throw new Error('Ошибка регистрации')
    }
  }

  async function verify(emailOrTelegramId, verificationCode) {
    try {
      await api.post('/auth/verify', { emailOrTelegramId, verificationCode })
    } catch (err) {
      throw new Error('Ошибка подтверждения')
    }
  }

  async function resendVerificationCode(emailOrTelegramId) {
    try {
      await api.post('/auth/resend', null, { params: { emailOrTelegramId } })
    } catch (err) {
      throw new Error('Ошибка повторной отправки кода')
    }
  }

  async function forgotPassword(email) {
    try {
      await api.post('/auth/forgot-password', { email })
    } catch (err) {
      throw new Error('Ошибка отправки письма для сброса пароля')
    }
  }

  async function resetPassword(token, password, confirmPassword) {
    try {
      await api.post('/auth/reset-password', { token, password, confirmPassword })
    } catch (err) {
      throw new Error('Ошибка сброса пароля')
    }
  }

  function logout() {
    removeAuthData()
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  return {
    authData,
    login,
    loginWithTelegram,
    register,
    verify,
    resendVerificationCode,
    forgotPassword,
    resetPassword,
    logout,
  }
})
