import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Оборачивает промис: при ошибке вызывает onError или ничего не делает.
 * @param {Promise} promise
 * @param {Function} [onError] - опциональный обработчик ошибки
 * @returns {Promise}
 */
export function safeCatch(promise, onError = () => {}) {
  return promise.catch(onError);
}
