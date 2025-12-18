"use client"

import Image from "next/image"

const IMAGES = [
  "https://images.pexels.com/photos/24709182/pexels-photo-24709182.jpeg",
  "https://images.pexels.com/photos/9585221/pexels-photo-9585221.jpeg",
  "https://images.pexels.com/photos/8370787/pexels-photo-8370787.jpeg",
  "https://images.pexels.com/photos/32123123/pexels-photo-32123123.jpeg",
  "https://images.pexels.com/photos/1524073/pexels-photo-1524073.jpeg",
  "https://images.pexels.com/photos/30820142/pexels-photo-30820142.jpeg",
]

export default function CryptoAfricaGallery() {
  const row = (reverse = false) => (
    <div className="flex gap-6 animate-ticker" style={{ animationDuration: "50s", animationDirection: reverse ? ("reverse" as const) : ("normal" as const) }}>
      {[...IMAGES, ...IMAGES].map((src, i) => (
        <div key={`${src}-${i}`} className="relative h-44 w-72 overflow-hidden rounded-2xl border-2 border-border shadow-lg">
          <Image src={src} alt="African crypto and finance imagery" fill className="object-cover" sizes="(max-width: 768px) 40vw, 25vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-border bg-card/30 p-4 shadow-xl">
      <div className="space-y-4">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
