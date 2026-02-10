import { useMemo, useState } from 'react';
import { generateRecruiterMessage } from '../ai/aiClient';

type Tone = 'friendly' | 'direct' | 'formal';

export default function AiRecruiterMessageModal({
  open,
  onClose,
  job,
  onSaveToNotes,
}: {
  open: boolean;
  onClose: () => void;
  job: { company: string; role: string; link?: string; notes?: string };
  onSaveToNotes?: (text: string) => void;
}) {
  const [tone, setTone] = useState<Tone>('friendly');
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const canGenerate = useMemo(
    () => job.company && job.role,
    [job.company, job.role],
  );

  if (!open) return null;

  async function onGenerate() {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);

    try {
      const out = await generateRecruiterMessage({
        company: job.company,
        jobTitle: job.role,
        jobUrl: job.link,
        notes: job.notes,
        tone,
      });

      setSubject(out.subject);
      setMessage(out.message);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to generate');
    } finally {
      setLoading(false);
    }
  }

  async function copyAll() {
    const text = `Subject: ${subject}\n\n${message}`;
    await navigator.clipboard.writeText(text);
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'
      onMouseDown={(e) => {
        // close when clicking the overlay
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className='w-full max-w-2xl rounded-2xl bg-zinc-950 p-4 shadow-xl ring-1 ring-white/10'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h2 className='text-lg font-semibold text-white'>
              AI: Recruiter message
            </h2>
            <p className='mt-1 text-sm text-white/70'>
              {job.company} — {job.role}
            </p>
          </div>
          <button
            onClick={onClose}
            className='rounded-lg px-3 py-1 text-sm text-white/80 hover:bg-white/10'
          >
            Close
          </button>
        </div>

        <div className='mt-4 flex flex-wrap items-center gap-2'>
          <label className='text-sm text-white/70'>Tone</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
            className='rounded-lg bg-white/5 px-3 py-2 text-sm text-white ring-1 ring-white/10'
          >
            <option value='friendly'>Friendly</option>
            <option value='direct'>Direct</option>
            <option value='formal'>Formal</option>
          </select>

          <button
            onClick={onGenerate}
            disabled={loading || !canGenerate}
            className='ml-auto rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50'
          >
            {loading ? 'Generating…' : 'Generate'}
          </button>
        </div>

        {error ? (
          <div className='mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-200 ring-1 ring-red-500/20'>
            {error}
          </div>
        ) : null}

        <div className='mt-4 space-y-3'>
          <div>
            <label className='text-sm text-white/70'>Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className='mt-1 w-full rounded-lg bg-white/5 px-3 py-2 text-sm text-white ring-1 ring-white/10'
              placeholder='Generated subject…'
            />
          </div>

          <div>
            <label className='text-sm text-white/70'>Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={7}
              className='mt-1 w-full rounded-lg bg-white/5 px-3 py-2 text-sm text-white ring-1 ring-white/10'
              placeholder='Generated message…'
            />
          </div>

          <div className='flex flex-wrap gap-2'>
            <button
              onClick={copyAll}
              disabled={!subject || !message}
              className='rounded-lg px-4 py-2 text-sm text-white ring-1 ring-white/15 hover:bg-white/10 disabled:opacity-50'
            >
              Copy
            </button>

            {onSaveToNotes ? (
              <button
                onClick={() =>
                  onSaveToNotes(
                    `Recruiter message\n\nSubject: ${subject}\n\n${message}`,
                  )
                }
                disabled={!subject || !message}
                className='rounded-lg px-4 py-2 text-sm text-white ring-1 ring-white/15 hover:bg-white/10 disabled:opacity-50'
              >
                Save to notes
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
