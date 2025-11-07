export function showNotification(message, type = 'success') {
  alert(`${type.toUpperCase()}: ${message}`)
}
