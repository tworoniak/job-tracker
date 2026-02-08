import type { ColumnId, WorkMode } from '../domain/types';
import { COLUMN_LABEL, COLUMN_ORDER } from '../domain/types';

export type Filters = {
  query: string;
  status: 'all' | ColumnId;
  workMode: 'all' | WorkMode;
};

export default function FiltersBar({
  value,
  onChange,
  totalVisible,
  totalAll,
}: {
  value: Filters;
  onChange: (next: Filters) => void;
  totalVisible: number;
  totalAll: number;
}) {
  const filtersActive =
    value.query.trim() !== '' ||
    value.status !== 'all' ||
    value.workMode !== 'all';

  return (
    <div className='rounded-2xl bg-zinc-900/40 p-4 ring-1 ring-zinc-800'>
      <div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'>
        <div className='grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          <label className='block'>
            <div className='mb-1 text-xs font-medium text-zinc-200'>Search</div>
            <input
              value={value.query}
              onChange={(e) => onChange({ ...value, query: e.target.value })}
              placeholder='Company or role…'
              className='w-full rounded-xl bg-zinc-950 px-3 py-2 text-sm ring-1 ring-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500'
            />
          </label>

          <label className='block'>
            <div className='mb-1 text-xs font-medium text-zinc-200'>Status</div>
            <select
              value={value.status}
              onChange={(e) =>
                onChange({
                  ...value,
                  status: e.target.value as Filters['status'],
                })
              }
              className='w-full rounded-xl bg-zinc-950 px-3 py-2 text-sm ring-1 ring-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500'
            >
              <option value='all'>All</option>
              {COLUMN_ORDER.map((c) => (
                <option key={c} value={c}>
                  {COLUMN_LABEL[c]}
                </option>
              ))}
            </select>
          </label>

          <label className='block'>
            <div className='mb-1 text-xs font-medium text-zinc-200'>
              Work mode
            </div>
            <select
              value={value.workMode}
              onChange={(e) =>
                onChange({
                  ...value,
                  workMode: e.target.value as Filters['workMode'],
                })
              }
              className='w-full rounded-xl bg-zinc-950 px-3 py-2 text-sm ring-1 ring-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500'
            >
              <option value='all'>Any</option>
              <option value='remote'>Remote</option>
              <option value='hybrid'>Hybrid</option>
              <option value='onsite'>On-site</option>
            </select>
          </label>
        </div>

        <div className='flex items-center justify-between gap-3 lg:justify-end'>
          <div className='text-sm text-zinc-300'>
            Showing{' '}
            <span className='text-zinc-50 font-medium'>{totalVisible}</span> of{' '}
            <span className='text-zinc-50 font-medium'>{totalAll}</span>
          </div>

          <button
            className='rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-60'
            disabled={!filtersActive}
            onClick={() =>
              onChange({ query: '', status: 'all', workMode: 'all' })
            }
          >
            Clear
          </button>
        </div>
      </div>

      {filtersActive && (
        <div className='mt-3 rounded-xl bg-zinc-950/60 p-3 text-xs text-zinc-300 ring-1 ring-zinc-800'>
          Filters are active — drag & drop is temporarily disabled to keep
          ordering stable.
        </div>
      )}
    </div>
  );
}
