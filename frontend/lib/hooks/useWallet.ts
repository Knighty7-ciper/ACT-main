"use client"

import { useWallet as useWalletContext } from "@/lib/contexts/wallet-context"

export function useWallet() {
  return useWalletContext()
}
