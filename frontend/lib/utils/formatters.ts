export const formatters = {
  formatCurrency(amount: number, currency = "ACT"): string {
    return `${amount.toFixed(2)} ${currency}`
  },

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  },

  formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  },

  formatNumber(num: number): string {
    return new Intl.NumberFormat("en-US").format(num)
  },

  formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`
  },

  truncateAddress(address: string, start = 6, end = 4): string {
    if (address.length <= start + end) return address
    return `${address.slice(0, start)}...${address.slice(-end)}`
  },

  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, "")
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }
    return phone
  },
}
