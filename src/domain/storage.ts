import type { BoardStateV1, BoardStateV2, ColumnId, JobCard } from './types';
import { COLUMN_ORDER } from './types';

const KEY = 'job-tracker:board:v2';

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

function looksLikeV2(x: unknown): x is BoardStateV2 {
  return (
    typeof x === 'object' &&
    x !== null &&
    (x as any).version === 2 &&
    typeof (x as any).cardsById === 'object' &&
    typeof (x as any).columnCardIds === 'object'
  );
}

function looksLikeV1(x: unknown): x is BoardStateV1 {
  return typeof x === 'object' && x !== null && Array.isArray((x as any).cards);
}

function migrateV1toV2(v1: BoardStateV1): BoardStateV2 {
  const next = emptyV2();

  for (const c of v1.cards) {
    next.cardsById[c.id] = c;
    // preserve their columnId and append
    next.columnCardIds[c.columnId].push(c.id);
  }

  // Ensure all columns exist / stable
  for (const col of COLUMN_ORDER) {
    next.columnCardIds[col] = next.columnCardIds[col] ?? [];
  }

  return next;
}

export function loadBoard(): BoardStateV2 {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (looksLikeV2(parsed)) return parsed;
    }

    // Try old key if you used v1 earlier (optional):
    const oldRaw = localStorage.getItem('job-tracker:board:v1');
    if (oldRaw) {
      const parsedOld = JSON.parse(oldRaw);
      if (looksLikeV1(parsedOld)) {
        const migrated = migrateV1toV2(parsedOld);
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
  localStorage.setItem(KEY, JSON.stringify(state));
}
