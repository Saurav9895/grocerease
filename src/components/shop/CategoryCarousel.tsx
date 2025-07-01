
"use client"

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import type { Category } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CategoryCarouselProps {
  categories: Category[]
}

export function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi, setSelectedIndex])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, setScrollSnaps, onSelect])

  return (
    <div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {categories.map((category) => (
            <div key={category.id} className="flex-shrink-0 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 pl-4">
              <Link href={`/category/${category.id}`} className="group block text-center">
                <div className="relative h-24 w-24 mx-auto drop-shadow-md transition-all duration-300 group-hover:drop-shadow-xl">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={category.name.toLowerCase()}
                  />
                </div>
                <p className="mt-2 text-sm font-medium uppercase tracking-wide text-muted-foreground transition-colors group-hover:text-primary">
                  {category.name}
                </p>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-6">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            aria-label={`Go to slide ${index + 1}`}
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              index === selectedIndex ? "bg-primary" : "bg-muted hover:bg-border"
            )}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  )
}
