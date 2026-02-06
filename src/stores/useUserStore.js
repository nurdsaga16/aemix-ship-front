import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api'

export const useUserStore = defineStore('users', () => {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  const page = ref(0)
  const size = ref(20)
  const totalElements = ref(0)
  const totalPages = ref(0)
  const last = ref(true)

  function parsePaginatedResponse(data) {
    const content = data?.content ?? []
    return content.map((u) => ({
      ...u,
      isEditing: false,
      draftRole: u.role,
    }))
  }

  async function fetchUsers({
    page: pageNum = 0,
    size: pageSize = 20,
    text = null,
    role = null,
    isVerified = null,
  } = {}) {
    loading.value = true
    error.value = null
    try {
      const params = { page: pageNum, size: pageSize }
      if (text != null && String(text).trim()) params.text = text.trim()
      if (role != null && role !== 'all') params.role = role
      if (isVerified === true) params.isVerified = true
      if (isVerified === false) params.isVerified = false

      const { data } = await api.get('/admin/users', { params })
      users.value = parsePaginatedResponse(data)
      page.value = data?.page ?? pageNum
      size.value = data?.size ?? pageSize
      totalElements.value = data?.totalElements ?? users.value.length
      totalPages.value = data?.totalPages ?? 1
      last.value = data?.last ?? true
      return { users: users.value, page: page.value, totalPages: totalPages.value, totalElements: totalElements.value }
    } catch (e) {
      error.value = e.response?.data?.message || 'Не удалось загрузить пользователей'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchFilteredUsers({ text = null, role = null } = {}) {
    return fetchUsers({ page: 0, text, role })
  }

  async function updateUser(emailOrTelegramId, payload) {
    error.value = null
    try {
      const { data } = await api.put(
        `/admin/users/${encodeURIComponent(emailOrTelegramId)}`,
        payload
      )
      const index = users.value.findIndex((u) => u.emailOrTelegramId === emailOrTelegramId)
      if (index !== -1) {
        users.value[index] = {
          ...users.value[index],
          ...data,
          draftRole: data.role,
        }
      }
      return data
    } catch (e) {
      error.value = e.response?.data?.message || 'Не удалось обновить пользователя'
      throw e
    }
  }

  async function deleteUser(emailOrTelegramId) {
    error.value = null
    try {
      await api.delete(`/admin/users/${encodeURIComponent(emailOrTelegramId)}`)
      users.value = users.value.filter((u) => u.emailOrTelegramId !== emailOrTelegramId)
    } catch (e) {
      error.value = e.response?.data?.message || 'Не удалось удалить пользователя'
      throw e
    }
  }

  return {
    users,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    last,
    fetchUsers,
    fetchFilteredUsers,
    updateUser,
    deleteUser,
  }
})
