import { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type { ColumnId, JobCard } from '../domain/types';
import { COLUMN_LABEL } from '../domain/types';
import CardItem from './CardItem';
import CardStatic from './CardStatic';

export default function Column({
  columnId,
  cards,
  cardIds,
  dndEnabled,
  onAdd,
  onEdit,
  onDelete,
}: {
  columnId: ColumnId;
  cards: JobCard[];
  cardIds: string[];
  dndEnabled: boolean;
  onAdd: () => void;
  onEdit: (card: JobCard) => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  const cardsById = useMemo(() => {
    const m = new Map(cards.map((c) => [c.id, c]));
    return m;
  }, [cards]);

  const orderedCards = cardIds
    .map((id) => cardsById.get(id))
    .filter(Boolean) as JobCard[];

  return (
    <div className='rounded-2xl bg-zinc-900/40 p-3 shadow-sm'>
      <div className='mb-3 flex items-center justify-between'>
        <div>
          <div className='text-sm font-semibold'>{COLUMN_LABEL[columnId]}</div>
          <div className='text-xs text-zinc-400'>{cardIds.length} items</div>
        </div>

        <button
          className='rounded-xl bg-zinc-800 px-3 py-1.5 text-xs hover:bg-zinc-700'
          onClick={onAdd}
        >
          Add
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={[
          'min-h-[120px] rounded-xl p-2 transition',
          isOver ? 'bg-zinc-800/60' : 'bg-zinc-900/20',
        ].join(' ')}
      >
        {dndEnabled ? (
          <SortableContext
            items={cardIds}
            strategy={verticalListSortingStrategy}
          >
            <div className='space-y-2'>
              {orderedCards.map((c) => (
                <CardItem
                  key={c.id}
                  card={c}
                  onEdit={() => onEdit(c)}
                  onDelete={() => onDelete(c.id)}
                />
              ))}
              {cardIds.length === 0 && (
                <div className='rounded-xl border border-dashed border-zinc-700 p-4 text-center text-xs text-zinc-400'>
                  Drop here
                </div>
              )}
            </div>
          </SortableContext>
        ) : (
          <div className='space-y-2'>
            {orderedCards.map((c) => (
              <CardStatic
                key={c.id}
                card={c}
                onEdit={() => onEdit(c)}
                onDelete={() => onDelete(c.id)}
              />
            ))}
            {cardIds.length === 0 && (
              <div className='rounded-xl border border-dashed border-zinc-700 p-4 text-center text-xs text-zinc-400'>
                No matches
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
