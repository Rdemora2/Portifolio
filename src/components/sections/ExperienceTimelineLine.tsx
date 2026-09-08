import styles from "./ExperienceTimelineLine.module.css";

export function ExperienceTimelineLine() {
  return (
    <div
      data-experience-timeline
      className={styles.timeline}
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
