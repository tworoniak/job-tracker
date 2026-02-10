import { useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import type { JobCard } from '../domain/types';
import AiRecruiterMessageModal from './AiRecruiterMessageModal';

export default function CardItem({
  card,
  onEdit,
  onDelete,
}: {
  card: JobCard;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [aiOpen, setAiOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'rounded-2xl bg-zinc-950 p-3 shadow-sm ring-1 ring-zinc-800',
        isDragging ? 'opacity-60' : 'opacity-100',
      ].join(' ')}
    >
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0'>
          <div className='truncate text-sm font-semibold'>{card.company}</div>
          <div className='truncate text-xs text-zinc-300'>{card.role}</div>

          {card.techStack?.length ? (
            <div className='mt-2 flex flex-wrap gap-1'>
              {card.techStack.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className='rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-200 ring-1 ring-zinc-800'
                >
                  {t}
                </span>
              ))}
              {card.techStack.length > 4 && (
                <span className='text-[10px] text-zinc-400'>
                  +{card.techStack.length - 4}
                </span>
              )}
            </div>
          ) : null}
        </div>

        <button
          className='cursor-grab rounded-lg bg-zinc-900 px-2 py-1 text-xs text-zinc-200 ring-1 ring-zinc-800 hover:bg-zinc-800'
          {...listeners}
          {...attributes}
          aria-label='Drag'
          title='Drag'
        >
          ::
        </button>
      </div>

      <div className='mt-2 flex items-center justify-between text-xs text-zinc-400'>
        <span>{card.appliedDate}</span>

        <div className='flex items-center gap-2'>
          {/* AI action */}
          <button
            className='text-zinc-200 hover:underline'
            onClick={(e) => {
              e.stopPropagation();
              setAiOpen(true);
            }}
          >
            AI
          </button>

          {card.link && (
            <a
              className='text-zinc-200 hover:underline'
              href={card.link}
              target='_blank'
              rel='noreferrer'
              onClick={(e) => e.stopPropagation()}
            >
              Link
            </a>
          )}

          <button
            className='text-zinc-200 hover:underline'
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            Edit
          </button>

          <button
            className='text-red-300 hover:underline'
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <AiRecruiterMessageModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        job={{
          company: card.company,
          role: card.role,
          link: card.link,
          // notes: card.notes, // uncomment once your JobCard has notes
        }}
        // onSaveToNotes={(text) => {
        //   // hook into your update flow once we see it
        // }}
      />
    </div>
  );
}
