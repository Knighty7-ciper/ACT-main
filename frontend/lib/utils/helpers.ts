export const helpers = {
  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  },

  generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  },

  debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null
    return (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },

  copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text)
  },

  downloadFile(data: string, filename: string, type = "text/plain"): void {
    const blob = new Blob([data], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  },

  parseJSON<T>(json: string, fallback: T): T {
    try {
      return JSON.parse(json)
    } catch {
      return fallback
    }
  },

  getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === "string") return error
    return "An unknown error occurred"
  },
}
