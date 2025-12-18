"use client"
import { FAQItem } from "./FAQItem"

interface FAQ {
  question: string
  answer: string
}

interface FAQListProps {
  faqs: FAQ[]
}

export function FAQList({ faqs }: FAQListProps) {
  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <FAQItem key={index} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  )
}
