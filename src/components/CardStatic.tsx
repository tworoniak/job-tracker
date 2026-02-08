import type { JobCard } from '../domain/types';

export default function CardStatic({
  card,
  onEdit,
  onDelete,
}: {
  card: JobCard;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className='rounded-2xl bg-zinc-950 p-3 shadow-sm ring-1 ring-zinc-800'>
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

        <div className='rounded-lg bg-zinc-900 px-2 py-1 text-[10px] text-zinc-300 ring-1 ring-zinc-800'>
          {card.workMode ?? '—'}
        </div>
      </div>

      <div className='mt-2 flex items-center justify-between text-xs text-zinc-400'>
        <span>{card.appliedDate}</span>
        <div className='flex items-center gap-2'>
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
          <button className='text-zinc-200 hover:underline' onClick={onEdit}>
            Edit
          </button>
          <button className='text-red-300 hover:underline' onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
