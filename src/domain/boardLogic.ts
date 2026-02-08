import type { BoardStateV2, ColumnId, JobCard } from './types';
import { COLUMN_ORDER } from './types';

export function upsertCard(state: BoardStateV2, card: JobCard): BoardStateV2 {
  const exists = Boolean(state.cardsById[card.id]);
  const prev = exists ? state.cardsById[card.id] : undefined;

  const next: BoardStateV2 = {
    ...state,
    cardsById: { ...state.cardsById, [card.id]: card },
    columnCardIds: { ...state.columnCardIds },
  };

  // New card: put at top of its column
  if (!exists) {
    next.columnCardIds[card.columnId] = [
      card.id,
      ...next.columnCardIds[card.columnId],
    ];
    return next;
  }

  // Existing card: if column changed, move ids between columns
  if (prev && prev.columnId !== card.columnId) {
    next.columnCardIds[prev.columnId] = next.columnCardIds[
      prev.columnId
    ].filter((id) => id !== card.id);
    next.columnCardIds[card.columnId] = [
      card.id,
      ...next.columnCardIds[card.columnId],
    ];
  }

  return next;
}

export function removeCard(state: BoardStateV2, id: string): BoardStateV2 {
  const card = state.cardsById[id];
  if (!card) return state;

  const next: BoardStateV2 = {
    ...state,
    cardsById: { ...state.cardsById },
    columnCardIds: { ...state.columnCardIds },
  };

  delete next.cardsById[id];
  next.columnCardIds[card.columnId] = next.columnCardIds[card.columnId].filter(
    (x) => x !== id,
  );

  return next;
}

export function ensureColumns(state: BoardStateV2): BoardStateV2 {
  const next = { ...state, columnCardIds: { ...state.columnCardIds } };
  for (const col of COLUMN_ORDER) {
    next.columnCardIds[col] = next.columnCardIds[col] ?? [];
  }
  return next;
}

export function moveCard(
  state: BoardStateV2,
  cardId: string,
  toColumn: ColumnId,
  toIndex: number,
): BoardStateV2 {
  const card = state.cardsById[cardId];
  if (!card) return state;

  const fromColumn = card.columnId;

  const next: BoardStateV2 = {
    ...state,
    cardsById: {
      ...state.cardsById,
      [cardId]: { ...card, columnId: toColumn },
    },
    columnCardIds: { ...state.columnCardIds },
  };

  // remove from old
  next.columnCardIds[fromColumn] = next.columnCardIds[fromColumn].filter(
    (id) => id !== cardId,
  );

  // insert into new
  const target = [...next.columnCardIds[toColumn]];
  const clamped = Math.max(0, Math.min(toIndex, target.length));
  target.splice(clamped, 0, cardId);
  next.columnCardIds[toColumn] = target;

  return next;
}

export function reorderWithinColumn(
  state: BoardStateV2,
  columnId: ColumnId,
  activeId: string,
  overId: string,
): BoardStateV2 {
  const ids = state.columnCardIds[columnId];
  const from = ids.indexOf(activeId);
  const to = ids.indexOf(overId);
  if (from === -1 || to === -1 || from === to) return state;

  const nextIds = [...ids];
  const [moved] = nextIds.splice(from, 1);
  nextIds.splice(to, 0, moved);

  return {
    ...state,
    columnCardIds: { ...state.columnCardIds, [columnId]: nextIds },
  };
}
