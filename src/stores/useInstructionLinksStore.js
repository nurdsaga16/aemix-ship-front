import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api'

export const useInstructionLinksStore = defineStore('instructionLinks', () => {
  const links = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchLinks() {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/instruction-links')
      links.value = data || []
      return links.value
    } catch (e) {
      error.value = e.response?.data?.message || 'Не удалось загрузить ссылки'
      links.value = []
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateLink(id, { title, link, subtitle }) {
    try {
      const { data } = await api.put(`/admin/instruction-links/${id}`, {
        title: title ?? '',
        link: link || '#',
        subtitle: subtitle ?? '',
      })
      const idx = links.value.findIndex((l) => l.id === id)
      if (idx >= 0) {
        links.value[idx] = data
      }
      return data
    } catch (e) {
      throw e
    }
  }

  return {
    links,
    loading,
    error,
    fetchLinks,
    updateLink,
  }
})
