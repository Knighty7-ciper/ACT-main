"use client"

import { useTheme as useThemeContext } from "@/lib/contexts/ThemeContext"

export function useTheme() {
  return useThemeContext()
}
