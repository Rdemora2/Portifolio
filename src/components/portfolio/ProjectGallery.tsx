"use client"

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
  if (!images || images.length === 0) return null

  // Duplicate images if less than 8 so Swiper 3D coverflow always has enough slides on both sides for seamless looping
  const displayImages = images.length < 8 ? [...images, ...images] : images

  return (
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
          {displayImages.map((image, i) => (
            <SwiperSlide key={i} className={styles.swiperSlide}>
              <div className={styles.galleryItemCard}>
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
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className={`swiper-pagination-custom ${styles.swiperPagination}`} />
      </div>
    </section>
  )
}
