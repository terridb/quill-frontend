export interface AuthFieldProps {
  id: string;
  label: string;
  type: "email" | "password" | "text";
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
}

export function AuthField({
  id,
  label,
  type,
  value,
  onChange,
  error,
  autoComplete,
}: AuthFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-label mb-2 block">
        {label}
      </label>
      <div className="input-surface rounded-2xl transition-[border-color,box-shadow]">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="focus-ring w-full rounded-2xl bg-transparent px-4 py-3.5 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)]"
        />
      </div>
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 text-sm text-[#8b3a3a]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
