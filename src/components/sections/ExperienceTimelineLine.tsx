import styles from "./ExperienceTimelineLine.module.css";

export function ExperienceTimelineLine() {
  return (
    <div
      data-experience-timeline
      className="pointer-events-none absolute left-0 top-0 hidden h-full w-[1.5px] lg:left-1/2 lg:block lg:-translate-x-1/2"
      aria-hidden="true"
    >
      <span className={styles.track} data-experience-timeline-track />
      <span
        className={styles.progress}
        data-experience-timeline-progress
      />
    </div>
  );
}
