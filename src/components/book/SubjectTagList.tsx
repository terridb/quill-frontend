export interface SubjectTagListProps {
  tags: string[];
}

export function SubjectTagList({ tags }: SubjectTagListProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <ul className="mt-4 flex flex-wrap gap-2" aria-label="Subjects">
      {tags.map((tag) => (
        <li key={tag}>
          <span className="chip-muted">{tag}</span>
        </li>
      ))}
    </ul>
  );
}
