"use client"

import Image from "next/image"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import type { Swiper as SwiperInstance } from "swiper"
import { Autoplay, EffectCoverflow } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"
import "swiper/css/effect-coverflow"

import type {
  ProjectGalleryImage,
  ProjectGalleryLabels,
} from "./ProjectGallery"
import styles from "./Portfolio.module.css"

interface ProjectGalleryCarouselProps {
  images: ProjectGalleryImage[]
  labels: ProjectGalleryLabels
  title: string
}

function nextIndex(current: number, length: number, direction: -1 | 1) {
  return (current + direction + length) % length
}

export function ProjectGalleryCarousel({
  images,
  labels,
  title,
}: ProjectGalleryCarouselProps) {
  const captionId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const swiperRef = useRef<SwiperInstance>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [allowsMotion, setAllowsMotion] = useState(false)
  const isDialogOpen = activeModalIndex !== null

  const closeGallery = useCallback(() => setActiveModalIndex(null), [])
  const moveModal = useCallback(
    (direction: -1 | 1) => {
      setActiveModalIndex((current) =>
        current === null ? null : nextIndex(current, images.length, direction),
      )
    },
    [images.length],
  )

  const handleDialogKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        closeGallery()
        return
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault()
        moveModal(event.key === "ArrowLeft" ? -1 : 1)
        return
      }

      if (event.key !== "Tab") return

      const dialog = dialogRef.current
      if (!dialog) return

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("hidden"))
      const first = focusable[0]
      const last = focusable.at(-1)
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [closeGallery, moveModal],
  )

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const syncMotionPreference = () => setAllowsMotion(!motionQuery.matches)

    syncMotionPreference()
    motionQuery.addEventListener("change", syncMotionPreference)
    return () => motionQuery.removeEventListener("change", syncMotionPreference)
  }, [])

  useEffect(() => {
    if (!isDialogOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleDialogKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleDialogKeyDown)
      triggerRef.current?.focus()
    }
  }, [handleDialogKeyDown, isDialogOpen])

  useEffect(() => {
    const autoplay = swiperRef.current?.autoplay
    if (!autoplay) return

    if (allowsMotion) autoplay.start()
    else autoplay.stop()
  }, [allowsMotion])

  const openGallery = (index: number, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger
    setActiveModalIndex(index)
  }
  const selectedImage =
    activeModalIndex === null ? null : images[activeModalIndex]

  return (
    <>
      <section className={styles.gallerySection} aria-label={title}>
        <div className={styles.container}>
          <div className={styles.galleryHeader}>
            <h2 className={styles.storyLabel}>{title}</h2>

            <div className={styles.galleryControls}>
              <button
                type="button"
                className={styles.galleryNavBtn}
                onClick={() => swiperRef.current?.slidePrev()}
                aria-label={labels.previous}
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                className={styles.galleryNavBtn}
                onClick={() => swiperRef.current?.slideNext()}
                aria-label={labels.next}
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.swiperContainerWrapper}>
          <Swiper
            modules={[EffectCoverflow, Autoplay]}
            effect="coverflow"
            grabCursor
            centeredSlides
            slidesPerView="auto"
            loop={images.length > 2}
            loopAdditionalSlides={2}
            watchSlidesProgress
            speed={allowsMotion ? 600 : 0}
            autoplay={
              allowsMotion
                ? {
                    delay: 4000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 140,
              modifier: 1.4,
              slideShadows: true,
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper
              setActiveSlideIndex(swiper.realIndex)
            }}
            onSlideChange={(swiper) => setActiveSlideIndex(swiper.realIndex)}
            className={styles.swiperGallery}
          >
            {images.map((image, index) => (
              <SwiperSlide key={image.src} className={styles.swiperSlide}>
                <button
                  type="button"
                  className={styles.galleryItemCard}
                  onClick={(event) => openGallery(index, event.currentTarget)}
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
                </button>
              </SwiperSlide>
            ))}
          </Swiper>

          <div
            className={styles.swiperPagination}
            role="group"
            aria-label={title}
          >
            {images.map((image, index) => (
              <button
                key={image.src}
                type="button"
                className={styles.galleryPaginationButton}
                data-active={activeSlideIndex === index}
                onClick={() => swiperRef.current?.slideToLoop(index)}
                aria-label={`${labels.open}: ${image.alt}`}
                aria-current={activeSlideIndex === index ? "true" : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      {selectedImage ? (
        <div
          ref={dialogRef}
          className={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeGallery()
          }}
          role="dialog"
          aria-modal="true"
          aria-label={labels.dialog}
          aria-describedby={captionId}
        >
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.modalCloseBtn}
            onClick={closeGallery}
            aria-label={labels.close}
          >
            <span aria-hidden="true">×</span>
          </button>

          <button
            type="button"
            className={`${styles.modalNavBtn} ${styles.modalNavPrev}`}
            onClick={() => moveModal(-1)}
            aria-label={labels.previous}
          >
            <span aria-hidden="true">←</span>
          </button>

          <div className={styles.modalContent}>
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              width={selectedImage.width}
              height={selectedImage.height}
              placeholder="blur"
              blurDataURL={selectedImage.blurDataURL}
              className={styles.modalImage}
              sizes="90vw"
            />
            <p id={captionId} className={styles.modalCaption}>
              {selectedImage.alt}
            </p>
          </div>

          <button
            type="button"
            className={`${styles.modalNavBtn} ${styles.modalNavNext}`}
            onClick={() => moveModal(1)}
            aria-label={labels.next}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : null}
    </>
  )
}
