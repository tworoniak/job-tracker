import Board from '../components/Board';

export default function App() {
  return (
    <div className='min-h-screen bg-background text-text'>
      <div className='mx-auto max-w-6xl px-4 py-10'>
        <div className='flex items-end justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-semibold'>Job Application Tracker</h1>
            <p className='text-sm text-zinc-300'>
              Kanban MVP (LocalStorage) — drag cards between columns.
            </p>
          </div>
        </div>

        <div className='mt-8'>
          <Board />
        </div>
      </div>
    </div>
  );
}
