export type ColumnId = 'applied' | 'interview' | 'offer' | 'rejected';

export const COLUMN_ORDER: ColumnId[] = [
  'applied',
  'interview',
  'offer',
  'rejected',
];

export const COLUMN_LABEL: Record<ColumnId, string> = {
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
};

export type WorkMode = 'remote' | 'hybrid' | 'onsite';

export type JobCard = {
  id: string;
  company: string;
  role: string;
  link?: string;
  appliedDate: string;
  columnId: ColumnId;

  workMode?: WorkMode;
  techStack?: string[]; // NEW
};

export type BoardStateV2 = {
  version: 2;
  cardsById: Record<string, JobCard>;
  columnCardIds: Record<ColumnId, string[]>;
};

export type BoardStateV1 = {
  cards: JobCard[];
};
