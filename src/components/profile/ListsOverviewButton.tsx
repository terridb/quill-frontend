import { FutureNavLink } from "@/src/components/profile/FutureNavLink";

export function ListsOverviewButton() {
  return (
    <div className="mt-10 border-t border-[var(--color-border)] pt-8 md:mt-12">
      <FutureNavLink
        label="View all lists"
        className="focus-ring flex w-full items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm font-medium md:max-w-[15rem]"
      />
    </div>
  );
}
