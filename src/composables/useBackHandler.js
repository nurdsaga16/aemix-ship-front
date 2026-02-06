import { useRouter } from 'vue-router'

/**
 * Composable для навигации "назад".
 * @param {Object} options
 * @param {string} [options.defaultTo='/'] - маршрут по умолчанию
 * @param {Function} [options.onBack] - кастомный обработчик (если передан, вызывается вместо router.push)
 * @returns {{ handleBack: Function }}
 */
export function useBackHandler(options = {}) {
  const router = useRouter()
  const { defaultTo = '/', onBack } = options

  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack()
    } else {
      router.push(defaultTo)
    }
  }

  return { handleBack }
}
