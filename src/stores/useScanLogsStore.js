import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api'

export const useScanLogsStore = defineStore('scanLogs', () => {
  const logs = ref([])
  const loading = ref(false)
  const error = ref(null)

  const page = ref(0)
  const size = ref(50)
  const totalElements = ref(0)
  const totalPages = ref(0)
  const last = ref(true)

  function toViewModel(e) {
    return {
      id: e.id,
      trackCode: e.trackCode,
      cityName: e.cityName,
      operator: e.operator,
      oldStatus: e.oldStatus,
      newStatus: e.newStatus,
      scannedAt: e.scannedAt,
    }
  }

  function parsePaginatedResponse(data) {
    const content = data?.content ?? []
    return content.map(toViewModel)
  }

  async function fetchLogs({
    page: pageNum = 0,
    size: pageSize = 50,
    operator,
    status,
    fromDate,
    toDate,
  } = {}) {
    loading.value = true
    error.value = null
    try {
      const params = {
        page: pageNum,
        size: pageSize,
      }

      if (operator) params.operator = operator
      if (status) params.status = status
      if (fromDate) params.fromDate = fromDate
      if (toDate) params.toDate = toDate

      const { data } = await api.get('/admin/scan-logs', { params })
      logs.value = parsePaginatedResponse(data)
      page.value = data?.page ?? pageNum
      size.value = data?.size ?? pageSize
      totalElements.value = data?.totalElements ?? logs.value.length
      totalPages.value = data?.totalPages ?? 1
      last.value = data?.last ?? true

      return {
        logs: logs.value,
        page: page.value,
        totalPages: totalPages.value,
        totalElements: totalElements.value,
      }
    } catch (e) {
      error.value = e.response?.data?.message || 'Не удалось загрузить логи сканирования'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    logs,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    last,
    fetchLogs,
  }
})

