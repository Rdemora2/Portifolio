import type { WebsiteExperience } from "@/types"

export const websiteExperiences = [
  {
    id: "luxury",
    href: "https://lp-institucional-vendas.vercel.app/",
    domain: "lp-institucional-vendas.vercel.app",
    image: {
      src: "/images/sites/luxury-experience.jpg",
      width: 1410,
      height: 831,
      blurDataURL:
        "data:image/jpeg;base64,/9j/2wBDABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z////////////////2wBDARsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z////////////////wgARCAAJABADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAABgX/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/aAAwDAQACEAMQAAAAkJDiuP/EABwQAAICAwEBAAAAAAAAAAAAAAEEAAIDIjRzgf/aAAgBAQABPwDLjAWprvW20TWXsouTgxkmktz/AExDiW8xP//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Af//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Af//Z",
    },
    tagIds: [
      "editorialExperience",
      "responsiveExperience",
      "frontendEngineering",
    ],
  },
  {
    id: "legal",
    href: "https://lp-institucional-advocacia.vercel.app/",
    domain: "lp-institucional-advocacia.vercel.app",
    image: {
      src: "/images/sites/legal-experience.jpg",
      width: 1410,
      height: 831,
      blurDataURL:
        "data:image/jpeg;base64,/9j/2wBDABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z////////////////2wBDARsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z////////////////wgARCAAJABADASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEBv/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIQAxAAAADP0IE//8QAHRAAAgIBBQAAAAAAAAAAAAAAAAECEiIREzNRgf/aAAgBAQABPwBvFE6beqqsfR8cTo//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AH//xAAVEQEBAAAAAAAAAAAAAAAAAAAAAf/aAAgBAwEBPwCP/9k=",
    },
    tagIds: [
      "institutionalStrategy",
      "responsiveExperience",
      "frontendEngineering",
    ],
  },
  {
    id: "tivix",
    href: "https://front-site-tivix-technologies.vercel.app/",
    domain: "front-site-tivix-technologies.vercel.app",
    image: {
      src: "/images/sites/tivix-experience.jpg",
      width: 1410,
      height: 831,
      blurDataURL:
        "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAJABADASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAIDBv/EAB8QAAEEAAcAAAAAAAAAAAAAAAEAAgMSBBEhIkFhkf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDJYdkcklXkDTl2Q9SyUtsBHRU0IP/Z",
    },
    tagIds: ["institutionalStrategy", "motionDesign", "frontendEngineering"],
  },
] as const satisfies readonly WebsiteExperience[]
