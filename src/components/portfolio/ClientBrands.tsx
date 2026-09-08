import Image from "next/image"
import { getTranslations } from "next-intl/server"
import { Link } from "@/navigation"
import { BrandMarquee } from "./BrandMarquee"
import styles from "./ClientBrands.module.css"

const brands = [
  { id: "newco", name: "Newco", file: "newco.jpg", width: 200, height: 200, slug: "band-news-bandsports" },
  { id: "bandsports", name: "BandSports", file: "bandsports.webp", width: 400, height: 225 },
  { id: "bandnews", name: "BandNews TV", file: "bandnews.webp", width: 400, height: 254 },
  { id: "arte1", name: "Arte 1", file: "arte1.png", width: 144, height: 145 },
  { id: "terraviva", name: "Terra Viva", file: "terraviva.png", width: 544, height: 296 },
  { id: "agromais", name: "Agro+", file: "agromais.webp", width: 400, height: 225 },
  { id: "globo", name: "Globo", file: "globo.svg", width: 72, height: 70 },
  { id: "sirio", name: "Hospital Sírio-Libanês", file: "sirio.svg", width: 567, height: 136, slug: "hospital-sirio-libanes" },
  { id: "omo", name: "OMO Lavanderia", file: "omo.svg", width: 256, height: 140 },
  { id: "housi", name: "Housi", file: "housi.webp", width: 7677, height: 2198 },
  { id: "premio-sde", name: "Prêmio SDE — Sou do Esporte", file: "premio-sde.png", width: 951, height: 431 },
] as const

export async function ClientBrands() {
  const t = await getTranslations("ClientBrands")

  return (
    <section className={styles.section} aria-labelledby="client-brands-title" data-home-section="clients">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={styles.heading}>
          <h2 id="client-brands-title">{t("title")}</h2>
          <p>{t("description")}</p>
        </div>
        <BrandMarquee pauseLabel={t("pauseMotion")} resumeLabel={t("resumeMotion")}>
          {[0, 1].map((copy) => (
            <ul className={styles.grid} key={copy} aria-hidden={copy === 1 ? true : undefined} data-brand-copy={copy}>
              {brands.map((brand) => {
                const logo = (
                  <Image
                    src={`/images/brands/${brand.file}`}
                    alt={copy === 0 ? brand.name : ""}
                    width={brand.width}
                    height={brand.height}
                    className={styles.logo}
                    sizes="176px"
                  />
                )

                return (
                  <li key={brand.id} className={styles.brand} data-brand={brand.id}>
                    {copy === 0 && "slug" in brand ? (
                      <Link
                        href={{ pathname: "/work/[slug]", params: { slug: brand.slug } }}
                        className={styles.logoFrame}
                        aria-label={`${brand.name} — ${t("case")}`}
                      >
                        {logo}
                      </Link>
                    ) : (
                      <div className={styles.logoFrame}>{logo}</div>
                    )}
                  </li>
                )
              })}
            </ul>
          ))}
        </BrandMarquee>
      </div>
    </section>
  )
}
