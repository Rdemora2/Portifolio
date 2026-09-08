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

function GalleryPreviewImage({ image }: { image: ProjectGalleryImage }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span
        className={`${styles.galleryImage} grid place-items-center bg-[var(--color-structure)] px-6 text-center text-[var(--color-text-secondary)]`}
        style={{ display: "grid" }}
        role="img"
        aria-label={image.alt}
      >
        <span aria-hidden="true">
          <svg className="mx-auto mb-3 h-7 w-7 text-[var(--color-signal)]" viewBox="0 0 24 24" fill="none">
            <path d="M4 5.75A1.75 1.75 0 0 1 5.75 4h12.5A1.75 1.75 0 0 1 20 5.75v12.5A1.75 1.75 0 0 1 18.25 20H5.75A1.75 1.75 0 0 1 4 18.25V5.75Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="m5 17 4.2-4.2 2.8 2.8 2.2-2.2L19 18M15.8 9.2h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="line-clamp-2 text-sm leading-relaxed">{image.alt}</span>
        </span>
      </span>
    )
  }

  return (
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
      onError={() => setFailed(true)}
    />
  )
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
          <div className={`${styles.galleryControls} ${styles.galleryControlPlaceholder}`} aria-hidden="true">
            {images.length > 1 ? <span className={styles.galleryMotionBtn}><span>Ⅱ</span><span>{labels.pause}</span></span> : null}
            <span className={styles.galleryNavBtn} />
            <span className={styles.galleryNavBtn} />
          </div>
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
                <GalleryPreviewImage image={image} />
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
      <div className={styles.swiperPagination} aria-hidden="true">
        <span className={styles.galleryPaginationButton} />
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
