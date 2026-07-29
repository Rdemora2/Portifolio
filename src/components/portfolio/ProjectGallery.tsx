"use client"

import { useState, useEffect, useCallback } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { EffectCoverflow, Autoplay, Navigation, Pagination } from "swiper/modules"
import Image from "next/image"

// Swiper styles
import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/navigation"
import "swiper/css/pagination"

import styles from "./Portfolio.module.css"

interface ProjectGalleryProps {
  images: {
    src: string
    width: number
    height: number
    alt: string
    blurDataURL: string
  }[]
  title: string
}

export function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null)

  // Handle escape key and arrows to control modal navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setActiveModalIndex(null)
    } else if (e.key === "ArrowLeft" && activeModalIndex !== null) {
      setActiveModalIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1))
    } else if (e.key === "ArrowRight" && activeModalIndex !== null) {
      setActiveModalIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0))
    }
  }, [activeModalIndex, images.length])

  useEffect(() => {
    if (activeModalIndex !== null) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [activeModalIndex, handleKeyDown])

  if (!images || images.length === 0) return null

  const selectedImage = activeModalIndex !== null ? images[activeModalIndex] : null

  // Duplicate images if less than 8 so Swiper 3D coverflow always has enough slides on both sides for seamless looping
  const displayImages = images.length < 8 ? [...images, ...images] : images

  return (
    <>
      <section className={styles.gallerySection}>
        <div className={styles.container}>
          <div className={styles.galleryHeader}>
            <h2 className={styles.storyLabel}>{title}</h2>
            
            <div className={styles.galleryControls}>
              <button 
                className={`swiper-button-prev-custom ${styles.galleryNavBtn}`}
                aria-label="Anterior"
              >
                <span aria-hidden="true">←</span>
              </button>
              <button 
                className={`swiper-button-next-custom ${styles.galleryNavBtn}`}
                aria-label="Próxima"
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.swiperContainerWrapper}>
          <Swiper
            modules={[EffectCoverflow, Autoplay, Navigation, Pagination]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            loop={true}
            loopAdditionalSlides={4}
            watchSlidesProgress={true}
            speed={600}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 140,
              modifier: 1.4,
              slideShadows: true,
            }}
            navigation={{
              prevEl: ".swiper-button-prev-custom",
              nextEl: ".swiper-button-next-custom",
            }}
            pagination={{
              clickable: true,
              el: ".swiper-pagination-custom",
            }}
            className={styles.swiperGallery}
          >
            {displayImages.map((image, i) => {
              const originalIndex = i % images.length
              return (
                <SwiperSlide key={i} className={styles.swiperSlide}>
                  <div 
                    className={styles.galleryItemCard}
                    onClick={() => setActiveModalIndex(originalIndex)}
                    title="Clique para ampliar"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      placeholder="blur"
                      blurDataURL={image.blurDataURL}
                      className={styles.galleryImage}
                      priority={i === 0}
                    />
                    <div className={styles.galleryExpandBadge}>
                      <span aria-hidden="true">🔍</span>
                    </div>
                  </div>
                </SwiperSlide>
              )
            })}
          </Swiper>
          <div className={`swiper-pagination-custom ${styles.swiperPagination}`} />
        </div>
      </section>

      {/* Fullscreen Lightbox Modal */}
      {selectedImage && (
        <div 
          className={styles.modalOverlay}
          onClick={() => setActiveModalIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Imagem ampliada"
        >
          <button
            className={styles.modalCloseBtn}
            onClick={() => setActiveModalIndex(null)}
            aria-label="Fechar galeria"
          >
            ✕
          </button>

          <button
            className={`${styles.modalNavBtn} ${styles.modalNavPrev}`}
            onClick={(e) => {
              e.stopPropagation()
              setActiveModalIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1))
            }}
            aria-label="Imagem anterior"
          >
            ←
          </button>

          <div 
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              width={selectedImage.width}
              height={selectedImage.height}
              placeholder="blur"
              blurDataURL={selectedImage.blurDataURL}
              className={styles.modalImage}
              priority
            />
            <p className={styles.modalCaption}>
              {selectedImage.alt}
            </p>
          </div>

          <button
            className={`${styles.modalNavBtn} ${styles.modalNavNext}`}
            onClick={(e) => {
              e.stopPropagation()
              setActiveModalIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0))
            }}
            aria-label="Próxima imagem"
          >
            →
          </button>
        </div>
      )}
    </>
  )
}
