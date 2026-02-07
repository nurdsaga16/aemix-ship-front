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

  readAuthData()

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
      const res = (await api.post('/auth/login', { emailOrTelegramId, password })).data
      if (res.isVerified === false && res.emailOrTelegramId) {
        return { isVerified: false, emailOrTelegramId: res.emailOrTelegramId }
      }
      saveAuthData({ token: res.token, emailOrTelegramId: emailOrTelegramId })
      return { isVerified: true }
    } catch (err) {
      throw new Error('Ошибка входа')
    }
  }

  async function loginWithTelegram(telegramPayload) {
    try {
      const res = (await api.post('/auth/telegram', telegramPayload)).data
      if (res.isVerified === false && res.emailOrTelegramId) {
        return { isVerified: false, emailOrTelegramId: res.emailOrTelegramId }
      }
      saveAuthData({
        token: res.token,
        telegramId: telegramPayload.id,
        telegramUsername: telegramPayload.username,
      })
      return { isVerified: true }
    } catch (err) {
      throw new Error('Ошибка входа через Telegram')
    }
  }

  function loginWithToken(token) {
    if (!token || typeof token !== 'string') return false
    const payload = parseJwtPayload(token)
    const emailOrTelegramId = payload?.emailOrTelegramId || payload?.sub
    saveAuthData({
      token,
      emailOrTelegramId: emailOrTelegramId ? String(emailOrTelegramId) : undefined,
      telegramId: /^\d+$/.test(String(emailOrTelegramId || '')) ? emailOrTelegramId : undefined,
    })
    return true
  }

  function parseJwtPayload(token) {
    try {
      const parts = token.split('.')
      if (parts.length < 2) return null
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
      const json = decodeURIComponent(
        atob(padded)
          .split('')
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join(''),
      )
      return JSON.parse(json)
    } catch {
      return null
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

  async function changePassword(currentPassword, newPassword, confirmPassword) {
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword, confirmPassword })
    } catch (err) {
      throw new Error('Ошибка изменения пароля')
    }
  }

  const isLoggingOut = ref(false)

  function logout() {
    isLoggingOut.value = true
    removeAuthData()
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  return {
    authData,
    isLoggingOut,
    login,
    loginWithTelegram,
    loginWithToken,
    register,
    verify,
    resendVerificationCode,
    forgotPassword,
    resetPassword,
    changePassword,
    logout,
  }
})
