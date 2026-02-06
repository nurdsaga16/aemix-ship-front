import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([])
  const loading = ref(false)
  const error = ref(null)
  const activeOrdersCount = ref(0)

  const page = ref(0)
  const size = ref(20)
  const totalElements = ref(0)
  const totalPages = ref(0)
  const last = ref(true)

  function mapStatus(apiStatus) {
    switch (apiStatus) {
      case 'UNKNOWN':
        return 'from_china'
      case 'INTERNATIONAL_SHIPPING':
        return 'shipped'
      case 'ARRIVED':
        return 'arrived'
      case 'READY':
        return 'ready'
      default:
        return 'from_china'
    }
  }

  function toOrderViewModel(o) {
    const createdDate = o.createdAt ? new Date(o.createdAt) : null
    const updatedDate = o.updatedAt ? new Date(o.updatedAt) : null

    const createdAtTs = createdDate && !Number.isNaN(createdDate.getTime()) ? createdDate.getTime() : 0
    const updatedAtTs = updatedDate && !Number.isNaN(updatedDate.getTime()) ? updatedDate.getTime() : 0

    const updatedAtLabel =
      updatedDate && !Number.isNaN(updatedDate.getTime())
        ? updatedDate.toLocaleString('ru-RU', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : ''

    return {
      trackCode: o.trackCode,
      title: o.title || o.trackCode,
      status: mapStatus(o.status),
      rawStatus: o.status,
      cityId: o.cityId,
      cityName: o.cityName,
      createdAt: createdAtTs,
      updatedAt: updatedAtTs,
      updatedAtLabel,
    }
  }

  function parsePaginatedResponse(data) {
    const content = data?.content ?? []
    return content.map(toOrderViewModel)
  }

  async function fetchOrders({
    trackCode = null,
    status = null,
    cityId = null,
    fromDate = null,
    toDate = null,
    page: pageNum = 0,
    size: pageSize = 20,
    sort = 'CREATED_DESC',
  } = {}) {
    loading.value = true
    error.value = null
    try {
      const params = {
        page: pageNum,
        size: pageSize,
        sort,
      }

      if (trackCode != null && String(trackCode).trim()) {
        params.trackCode = String(trackCode).trim()
      }
      if (status != null && String(status).trim()) {
        params.status = String(status).trim()
      }
      if (cityId != null && cityId !== 'all') {
        params.cityId = cityId
      }
      if (fromDate != null) {
        params.fromDate = fromDate
      }
      if (toDate != null) {
        params.toDate = toDate
      }

      const { data } = await api.get('/admin/orders', { params })
      orders.value = parsePaginatedResponse(data)
      page.value = data?.page ?? pageNum
      size.value = data?.size ?? pageSize
      totalElements.value = data?.totalElements ?? orders.value.length
      totalPages.value = data?.totalPages ?? 1
      last.value = data?.last ?? true

      return {
        orders: orders.value,
        page: page.value,
        totalPages: totalPages.value,
        totalElements: totalElements.value,
      }
    } catch (e) {
      error.value = e.response?.data?.message || 'Не удалось загрузить заказы'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchCities() {
    const { data } = await api.get('/cities')
    return Array.isArray(data) ? data : []
  }

  async function uploadOrders({ cityId, orders }) {
    const payload = {
      cityId: Number(cityId),
      orders: orders.map((row) => ({
        trackCode: row.trackCode,
      })),
    }

    const { data } = await api.post('/admin/orders/upload', payload)
    return data
  }

  async function fetchActiveOrdersCount() {
    try {
      const { data } = await api.get('/user/orders/active-count')
      activeOrdersCount.value = Number(data) || 0
      return activeOrdersCount.value
    } catch (e) {
      activeOrdersCount.value = 0
      return 0
    }
  }

  async function fetchMyOrders({
    text = null,
    status = null,
    cityId = null,
    fromDate = null,
    toDate = null,
    page: pageNum = 0,
    size: pageSize = 20,
    sort = 'CREATED_DESC',
  } = {}) {
    loading.value = true
    error.value = null
    try {
      const params = {
        page: pageNum,
        size: pageSize,
        sort,
      }

      if (text != null && String(text).trim()) {
        params.text = String(text).trim()
      }
      if (status != null && String(status).trim()) {
        params.status = String(status).trim()
      }
      if (cityId != null && cityId !== 'all') {
        params.cityId = cityId
      }
      if (fromDate != null) {
        params.fromDate = fromDate
      }
      if (toDate != null) {
        params.toDate = toDate
      }

      const { data } = await api.get('/user/orders', { params })
      orders.value = parsePaginatedResponse(data)
      page.value = data?.page ?? pageNum
      size.value = data?.size ?? pageSize
      totalElements.value = data?.totalElements ?? orders.value.length
      totalPages.value = data?.totalPages ?? 1
      last.value = data?.last ?? true

      return {
        orders: orders.value,
        page: page.value,
        totalPages: totalPages.value,
        totalElements: totalElements.value,
      }
    } catch (e) {
      error.value = e.response?.data?.message || 'Не удалось загрузить заказы'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function addOrderToUser(trackCode, title = null) {
    if (!trackCode || !String(trackCode).trim()) {
      throw new Error('Трек‑код обязателен')
    }

    try {
      const payload = {
        trackCode: String(trackCode).trim(),
      }
      if (title) {
        payload.title = String(title).trim()
      }
      const { data } = await api.post('/user/orders', payload)
      return data
    } catch (e) {
      throw e
    }
  }

  async function updateOrderTitle(trackCode, title) {
    if (!trackCode || !String(trackCode).trim()) {
      throw new Error('Трек‑код обязателен')
    }

    try {
      const { data } = await api.put(`/user/orders/${String(trackCode).trim()}/title`, {
        title: title ? String(title).trim() : null,
      })
      return data
    } catch (e) {
      throw e
    }
  }

  async function scanArrived(trackCode) {
    if (!trackCode || !String(trackCode).trim()) {
      throw new Error('Трек‑код обязателен')
    }

    try {
      const { data } = await api.post(`/admin/orders/${String(trackCode).trim()}/scan-arrived`)
      return data
    } catch (e) {
      throw e
    }
  }

  async function bulkReady(trackCodes) {
    if (!Array.isArray(trackCodes) || trackCodes.length === 0) {
      throw new Error('Выберите хотя бы один заказ')
    }
    const list = trackCodes.map((c) => String(c).trim()).filter(Boolean)
    if (list.length === 0) throw new Error('Список трек-кодов пуст')
    const { data } = await api.post('/admin/orders/bulk-ready', { trackCodes: list })
    return data
  }

  return {
    orders,
    loading,
    error,
    activeOrdersCount,
    page,
    size,
    totalElements,
    totalPages,
    last,
    fetchActiveOrdersCount,
    fetchOrders,
    fetchMyOrders,
    fetchCities,
    uploadOrders,
    addOrderToUser,
    updateOrderTitle,
    scanArrived,
    bulkReady,
  }
})