import { gsap } from "gsap";

if (typeof window !== "undefined") {
  gsap.defaults({
    ease: "power3.out",
    duration: 0.8,
  });
}

export { gsap };
