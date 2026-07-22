import Link from "next/link";
import { QuillMascot } from "@/src/components/ui/QuillMascot";

const STARTERS = [
  { label: "Surprise me", href: "/ai-chat" },
  { label: "Something short", href: "/ai-chat" },
  { label: "Like what I finished", href: "/ai-chat" },
] as const;

export function RecommendPromo() {
  return (
    <section
      aria-labelledby="recommend-promo-heading"
      className="recommend-promo mt-10"
    >
      <div className="recommend-promo-stage">
        <span className="recommend-promo-splash recommend-promo-splash--a" aria-hidden="true" />
        <span className="recommend-promo-splash recommend-promo-splash--b" aria-hidden="true" />
        <span className="recommend-promo-splash recommend-promo-splash--c" aria-hidden="true" />

        <div className="recommend-promo-body">
          <p className="recommend-promo-live">
            <span className="recommend-promo-live__dot" aria-hidden="true" />
            Quill’s free
          </p>
          <h2
            id="recommend-promo-heading"
            className="recommend-promo-title text-display"
          >
            Ask Quill!
          </h2>
          <p className="recommend-promo-lede">
            Your otter for what to read next. He digs your shelves and brings
            back the good stuff. No worries, spoilers stay sealed!
          </p>

          <ul className="recommend-promo-chips">
            {STARTERS.map((starter) => (
              <li key={starter.label}>
                <Link href={starter.href} className="recommend-promo-chip focus-ring">
                  {starter.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link href="/ai-chat" className="recommend-promo-cta focus-ring">
            Chat with Quill
            <span aria-hidden="true" className="recommend-promo-cta__arrow">
              →
            </span>
          </Link>
        </div>

        <div className="recommend-promo-sticker" aria-hidden="true">
          <p className="recommend-promo-bubble">Got a reading itch?</p>
          <div className="recommend-promo-sticker__pad">
            <QuillMascot mood="happy" size="xl" className="recommend-promo-mascot" />
          </div>
        </div>
      </div>
    </section>
  );
}
