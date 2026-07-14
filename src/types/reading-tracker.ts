export interface TrackerBook {
  entryId: string;
  bookId: string;
  title: string;
  authors: string;
  coverUrl: string | null;
  currentPage: number | null;
  pageCount: number | null;
  progressPercent: number | null;
  pagesReadToday: number | null;
  readToday: boolean;
}

export interface WeekDay {
  label: string;
  name: string;
  date: string;
  read: boolean;
}

export interface ReadingTrackerData {
  books: TrackerBook[];
  weekDays: WeekDay[];
  streak: number;
  readToday: boolean;
}
