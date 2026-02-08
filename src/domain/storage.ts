import type { BoardStateV1, BoardStateV2, ColumnId, JobCard } from './types';
import { COLUMN_ORDER } from './types';

const KEY_V2 = 'job-tracker:board:v2';
const KEY_V1 = 'job-tracker:board:v1';

function emptyV2(): BoardStateV2 {
  return {
    version: 2,
    cardsById: {},
    columnCardIds: {
      applied: [],
      interview: [],
      offer: [],
      rejected: [],
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isColumnId(value: unknown): value is ColumnId {
  return (
    typeof value === 'string' && (COLUMN_ORDER as string[]).includes(value)
  );
}

function isJobCard(value: unknown): value is JobCard {
  if (!isRecord(value)) return false;

  const id = value.id;
  const company = value.company;
  const role = value.role;
  const appliedDate = value.appliedDate;
  const columnId = value.columnId;

  if (typeof id !== 'string') return false;
  if (typeof company !== 'string') return false;
  if (typeof role !== 'string') return false;
  if (typeof appliedDate !== 'string') return false;
  if (!isColumnId(columnId)) return false;

  // optional fields
  if (
    'link' in value &&
    value.link !== undefined &&
    typeof value.link !== 'string'
  )
    return false;
  if (
    'workMode' in value &&
    value.workMode !== undefined &&
    value.workMode !== 'remote' &&
    value.workMode !== 'hybrid' &&
    value.workMode !== 'onsite'
  )
    return false;

  if ('techStack' in value && value.techStack !== undefined) {
    if (!Array.isArray(value.techStack)) return false;
    if (!value.techStack.every((t) => typeof t === 'string')) return false;
  }

  return true;
}

function looksLikeV2(value: unknown): value is BoardStateV2 {
  if (!isRecord(value)) return false;
  if (value.version !== 2) return false;

  const cardsById = value.cardsById;
  const columnCardIds = value.columnCardIds;

  if (!isRecord(cardsById) || !isRecord(columnCardIds)) return false;

  // validate columnCardIds shape
  for (const col of COLUMN_ORDER) {
    const ids = columnCardIds[col];
    if (!Array.isArray(ids) || !ids.every((x) => typeof x === 'string'))
      return false;
  }

  // validate cardsById values
  for (const k of Object.keys(cardsById)) {
    if (!isJobCard(cardsById[k])) return false;
  }

  return true;
}

function looksLikeV1(value: unknown): value is BoardStateV1 {
  if (!isRecord(value)) return false;
  const cards = value.cards;
  if (!Array.isArray(cards)) return false;
  return cards.every(isJobCard);
}

function migrateV1toV2(v1: BoardStateV1): BoardStateV2 {
  const next = emptyV2();

  for (const card of v1.cards) {
    next.cardsById[card.id] = card;
    next.columnCardIds[card.columnId].push(card.id);
  }

  return next;
}

/** Always returns a valid V2 state */
export function loadBoard(): BoardStateV2 {
  try {
    // Try v2 first
    const rawV2 = localStorage.getItem(KEY_V2);
    if (rawV2) {
      const parsed: unknown = JSON.parse(rawV2);
      if (looksLikeV2(parsed)) return parsed;
    }

    // Fallback: migrate v1 if present
    const rawV1 = localStorage.getItem(KEY_V1);
    if (rawV1) {
      const parsed: unknown = JSON.parse(rawV1);
      if (looksLikeV1(parsed)) {
        const migrated = migrateV1toV2(parsed);
        saveBoard(migrated);
        return migrated;
      }
    }

    return emptyV2();
  } catch {
    return emptyV2();
  }
}

export function saveBoard(state: BoardStateV2) {
  localStorage.setItem(KEY_V2, JSON.stringify(state));
}
