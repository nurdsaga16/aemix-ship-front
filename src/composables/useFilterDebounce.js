import { watch, onUnmounted } from 'vue'

/**
 * Дебаунс для фильтров: при изменении источников вызывается callback через delay мс.
 * Таймер очищается при размонтировании.
 *
 * @param {import('vue').Ref[]} sources - массив ref'ов, за которыми следить
 * @param {Function} callback - функция для вызова (без аргументов)
 * @param {number} [delay=400] - задержка в мс
 */
export function useFilterDebounce(sources, callback, delay = 400) {
  let timeoutId = null

  watch(sources, () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      callback()
      timeoutId = null
    }, delay)
  })

  onUnmounted(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })
}
