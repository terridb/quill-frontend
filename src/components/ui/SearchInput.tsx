import { SearchIcon } from "@/src/components/ui/icons";

export interface SearchInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  "aria-controls"?: string;
  combobox?: boolean;
  "aria-expanded"?: boolean;
}

export function SearchInput({
  id,
  value,
  onChange,
  placeholder = "Title or author",
  label = "Search books",
  className = "",
  onFocus,
  onBlur,
  inputRef,
  "aria-controls": ariaControls,
  combobox = false,
  "aria-expanded": ariaExpanded,
}: SearchInputProps) {
  return (
    <div className={`input-surface relative rounded-2xl transition-[border-color,box-shadow] ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-[var(--color-muted)]" />
      <input
        ref={inputRef}
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete="off"
        role={combobox ? "combobox" : undefined}
        aria-controls={ariaControls}
        aria-expanded={combobox ? ariaExpanded : undefined}
        className="search-input focus-ring w-full rounded-2xl bg-transparent py-3.5 pr-11 pl-11 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)]"
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="focus-ring absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--color-muted)] hover:bg-[var(--color-fill)] hover:text-[var(--color-ink)]"
        >
          <span aria-hidden="true" className="text-base leading-none">
            ×
          </span>
        </button>
      ) : null}
    </div>
  );
}
