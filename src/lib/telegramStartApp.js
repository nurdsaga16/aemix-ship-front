/**
 * Извлекает startapp токен из URL или initData Telegram Web App.
 * Telegram передаёт его как GET-параметр tgWebAppStartParam, в hash или в initDataUnsafe.start_param.
 */
export function getStartAppToken() {
  const search = window.location.search?.slice(1) || ''
  const hash = window.location.hash?.slice(1) || ''
  const searchParams = new URLSearchParams(search)
  const hashParams = new URLSearchParams(hash)
  const tg = window.Telegram?.WebApp
  return (
    searchParams.get('tgWebAppStartParam') ||
    hashParams.get('tgWebAppStartParam') ||
    tg?.initDataUnsafe?.start_param ||
    ''
  ).trim()
}
