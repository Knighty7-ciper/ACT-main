export const validators = {
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isValidStellarPublicKey(key: string): boolean {
    return key.startsWith("G") && key.length === 56
  },

  isValidAmount(amount: number): boolean {
    return amount > 0 && Number.isFinite(amount)
  },

  isValidPassword(password: string): boolean {
    return password.length >= 8
  },

  isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return phoneRegex.test(phone)
  },

  isValidMemo(memo: string): boolean {
    return memo.length <= 28
  },
}
