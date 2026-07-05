export interface GenreChipListProps {
  labels: string[];
  className?: string;
}

export function GenreChipList({ labels, className = "" }: GenreChipListProps) {
  if (labels.length === 0) {
    return null;
  }

  return (
    <ul
      className={`mt-3 flex flex-wrap gap-2 ${className}`}
      aria-label="Genres"
    >
      {labels.map((label) => (
        <li key={label}>
          <span className="chip">{label}</span>
        </li>
      ))}
    </ul>
  );
}
