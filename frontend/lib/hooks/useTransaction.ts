"use client"

import { useTransaction as useTransactionContext } from "@/lib/contexts/TransactionContext"

export function useTransaction() {
  return useTransactionContext()
}
