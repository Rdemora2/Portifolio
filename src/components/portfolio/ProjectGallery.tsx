"use client"

import Image from "next/image"
import { lazy, Suspense, useEffect, useRef, useState } from "react"

import styles from "./Portfolio.module.css"

export interface ProjectGalleryImage {
  src: string
  width: number
  height: number
  alt: string
  blurDataURL: string
}

export interface ProjectGalleryLabels {
  close: string
  dialog: string
  goTo: string
  next: string
  open: string
  pause: string
  previous: string
  resume: string
}

interface ProjectGalleryProps {
  images: ProjectGalleryImage[]
  labels: ProjectGalleryLabels
  title: string
}

const ProjectGalleryCarousel = lazy(
  () =>
    import("./ProjectGalleryCarousel").then(
      (module) => ({ default: module.ProjectGalleryCarousel }),
    ),
)

function ProjectGalleryPreview({
  images,
  labels,
  title,
}: ProjectGalleryProps) {
  return (
    <section className={styles.gallerySection} aria-label={title}>
      <div className={styles.container}>
        <div className={styles.galleryHeader}>
          <h2 className={styles.storyLabel}>{title}</h2>
        </div>
      </div>

      <div className={styles.galleryPreviewViewport}>
        <ul className={styles.galleryPreviewTrack}>
          {images.map((image, index) => (
            <li key={image.src} className={styles.galleryPreviewSlide}>
              <a
                href={image.src}
                className={styles.galleryItemCard}
                aria-label={`${labels.open}: ${image.alt}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  placeholder="blur"
                  blurDataURL={image.blurDataURL}
                  className={styles.galleryImage}
                  loading="lazy"
                  sizes="(min-width: 1200px) 38vw, (min-width: 768px) 50vw, 70vw"
                />
                <span className={styles.galleryExpandBadge} aria-hidden="true">
                  +
                </span>
                <span className={styles.galleryImageIndex} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function ProjectGallery(props: ProjectGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [shouldEnhance, setShouldEnhance] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root || !("IntersectionObserver" in window)) {
      setShouldEnhance(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setShouldEnhance(true)
        observer.disconnect()
      },
      { rootMargin: "900px 0px" },
    )

    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  if (props.images.length === 0) return null

  return (
    <div ref={rootRef} data-project-gallery="true">
      {shouldEnhance ? (
        <Suspense fallback={<ProjectGalleryPreview {...props} />}>
          <ProjectGalleryCarousel {...props} />
        </Suspense>
      ) : (
        <ProjectGalleryPreview {...props} />
      )}
    </div>
  )
}
