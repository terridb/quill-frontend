"use client";

import { useState } from "react";
import { SubjectTagList } from "@/src/components/book/SubjectTagList";

export interface BookDescriptionProps {
  description: string;
  subjectTags: string[];
  className?: string;
}

export function BookDescription({
  description,
  subjectTags,
  className = "book-section-rule",
}: BookDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = description.length > 280;

  return (
    <section className={className} aria-labelledby="book-description-heading">
      <h2 id="book-description-heading" className="sr-only">
        Description
      </h2>
      <p
        className={`text-[15px] leading-relaxed text-[var(--color-ink-secondary)] ${
          !isExpanded && isLong ? "line-clamp-4" : ""
        }`}
      >
        {description}
      </p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="focus-ring mt-3 text-sm font-medium text-[var(--color-accent)]"
          aria-expanded={isExpanded}
        >
          {isExpanded ? "Read less" : "Read more"}
        </button>
      ) : null}
      <SubjectTagList tags={subjectTags} />
    </section>
  );
}
