"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface FAQItemProps {
  question: string
  answer: string
}

export function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium">{question}</span>
        <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen && "transform rotate-180")} />
      </button>
      {isOpen && (
        <div className="p-4 pt-0 text-muted-foreground">
          <p>{answer}</p>
        </div>
      )}
    </div>
  )
}
