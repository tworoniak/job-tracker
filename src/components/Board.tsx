import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { v4 as uuid } from 'uuid';

import type { BoardStateV2, ColumnId, JobCard } from '../domain/types';
import { COLUMN_ORDER } from '../domain/types';
import { loadBoard, saveBoard } from '../domain/storage';
import {
  ensureColumns,
  moveCard,
  removeCard,
  reorderWithinColumn,
  upsertCard,
} from '../domain/boardLogic';

import Column from './Column';
import JobFormModal from './JobFormModal';
import FiltersBar, { type Filters } from './FiltersBar';

type ModalState =
  | { open: false }
  | { open: true; mode: 'create'; initial?: Partial<JobCard> }
  | { open: true; mode: 'edit'; card: JobCard };

function isColumnId(id: string): id is ColumnId {
  return COLUMN_ORDER.includes(id as ColumnId);
}

export default function Board() {
  const [state, setState] = useState<BoardStateV2>(() =>
    ensureColumns(loadBoard()),
  );

  const [modal, setModal] = useState<ModalState>({ open: false });

  const [filters, setFilters] = useState<Filters>({
    query: '',
    status: 'all',
    workMode: 'all',
  });

  const filtersActive =
    filters.query.trim() !== '' ||
    filters.status !== 'all' ||
    filters.workMode !== 'all';

  const dndEnabled = !filtersActive;

  useEffect(() => {
    saveBoard(state);
  }, [state]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const cardsByColumn = useMemo(() => {
    const result: Record<ColumnId, JobCard[]> = {
      applied: [],
      interview: [],
      offer: [],
      rejected: [],
    };

    for (const id in state.cardsById) {
      const c = state.cardsById[id];
      result[c.columnId].push(c);
    }

    return result;
  }, [state.cardsById]);

  function matchesFilters(card: JobCard) {
    const q = filters.query.trim().toLowerCase();

    const matchesQuery =
      q === '' ||
      card.company.toLowerCase().includes(q) ||
      card.role.toLowerCase().includes(q);

    const matchesStatus =
      filters.status === 'all' || card.columnId === filters.status;

    const matchesWorkMode =
      filters.workMode === 'all' || card.workMode === filters.workMode;

    return matchesQuery && matchesStatus && matchesWorkMode;
  }

  const filteredColumnIds = useMemo(() => {
    const result: Record<ColumnId, string[]> = {
      applied: [],
      interview: [],
      offer: [],
      rejected: [],
    };

    for (const col of COLUMN_ORDER) {
      result[col] = state.columnCardIds[col].filter((id) => {
        const card = state.cardsById[id];
        return card ? matchesFilters(card) : false;
      });
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, filters]);

  const totalAll = Object.keys(state.cardsById).length;
  const totalVisible = COLUMN_ORDER.reduce(
    (sum, c) => sum + filteredColumnIds[c].length,
    0,
  );

  function findContainer(id: string): ColumnId | null {
    if (isColumnId(id)) return id;
    for (const col of COLUMN_ORDER) {
      if (state.columnCardIds[col].includes(id)) return col;
    }
    return null;
  }

  function openCreate(columnId?: ColumnId) {
    setModal({
      open: true,
      mode: 'create',
      initial: {
        columnId: columnId ?? 'applied',
        appliedDate: new Date().toISOString().slice(0, 10),
      },
    });
  }

  function openEdit(card: JobCard) {
    setModal({ open: true, mode: 'edit', card });
  }

  function closeModal() {
    setModal({ open: false });
  }

  function onDragOver(e: DragOverEvent) {
    if (!dndEnabled) return;

    const activeId = String(e.active.id);
    const overId = e.over?.id ? String(e.over.id) : null;
    if (!overId) return;

    const fromCol = findContainer(activeId);
    const toCol = findContainer(overId);
    if (!fromCol || !toCol) return;

    if (fromCol === toCol) return;

    const toIndex = isColumnId(overId)
      ? state.columnCardIds[toCol].length
      : state.columnCardIds[toCol].indexOf(overId);

    if (toIndex < 0) return;

    setState((s) => moveCard(s, activeId, toCol, toIndex));
  }

  function onDragEnd(e: DragEndEvent) {
    if (!dndEnabled) return;

    const activeId = String(e.active.id);
    const overId = e.over?.id ? String(e.over.id) : null;
    if (!overId) return;

    const fromCol = findContainer(activeId);
    const toCol = findContainer(overId);
    if (!fromCol || !toCol) return;

    // Reorder within same column if dropped on another card
    if (fromCol === toCol && !isColumnId(overId)) {
      setState((s) => reorderWithinColumn(s, fromCol, activeId, overId));
      return;
    }

    // Dropped on a column itself => move to end
    if (isColumnId(overId) && fromCol !== toCol) {
      setState((s) =>
        moveCard(s, activeId, toCol, s.columnCardIds[toCol].length),
      );
    }
  }

  function parseTechStack(input?: string) {
    if (!input) return undefined;

    const tags = input
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.replace(/\s+/g, ' '));

    // de-dupe (case-insensitive), preserve first casing
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const t of tags) {
      const key = t.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(t);
    }

    return unique.length ? unique : undefined;
  }

  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <button
          className='rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white'
          onClick={() => openCreate('applied')}
        >
          + Add application
        </button>

        <div className='text-sm text-zinc-300'>
          Total: <span className='text-zinc-50'>{totalAll}</span>
        </div>
      </div>

      <div className='mb-4'>
        <FiltersBar
          value={filters}
          onChange={setFilters}
          totalVisible={totalVisible}
          totalAll={totalAll}
        />
      </div>

      {dndEnabled ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            {COLUMN_ORDER.map((colId) => (
              <Column
                key={colId}
                columnId={colId}
                cards={cardsByColumn[colId]}
                cardIds={filteredColumnIds[colId]}
                dndEnabled={true}
                onAdd={() => openCreate(colId)}
                onEdit={openEdit}
                onDelete={(id) => setState((s) => removeCard(s, id))}
              />
            ))}
          </div>
        </DndContext>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {COLUMN_ORDER.map((colId) => (
            <Column
              key={colId}
              columnId={colId}
              cards={cardsByColumn[colId]}
              cardIds={filteredColumnIds[colId]}
              dndEnabled={false}
              onAdd={() => openCreate(colId)}
              onEdit={openEdit}
              onDelete={(id) => setState((s) => removeCard(s, id))}
            />
          ))}
        </div>
      )}

      {modal.open && (
        <JobFormModal
          mode={modal.mode}
          initial={modal.mode === 'edit' ? modal.card : (modal.initial ?? {})}
          onClose={closeModal}
          onSubmit={(values) => {
            const techStack = parseTechStack(values.techStackInput);

            const next: JobCard =
              modal.mode === 'edit'
                ? {
                    ...modal.card,
                    company: values.company,
                    role: values.role,
                    link: values.link || undefined,
                    appliedDate: values.appliedDate,
                    columnId: values.columnId,
                    workMode: values.workMode,
                    techStack,
                  }
                : {
                    id: uuid(),
                    company: values.company,
                    role: values.role,
                    link: values.link || undefined,
                    appliedDate: values.appliedDate,
                    columnId: values.columnId,
                    workMode: values.workMode,
                    techStack,
                  };

            setState((s) => upsertCard(s, next));
            closeModal();
          }}
        />
      )}
    </div>
  );
}
