import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { JobCard, ColumnId } from '../domain/types';
import { COLUMN_LABEL, COLUMN_ORDER } from '../domain/types';
import { jobSchema, type JobFormValues } from '../domain/jobSchema';

export default function JobFormModal({
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  mode: 'create' | 'edit';
  initial: Partial<JobCard>;
  onClose: () => void;
  onSubmit: (values: JobFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      company: initial.company ?? '',
      role: initial.role ?? '',
      link: initial.link ?? '',
      appliedDate: initial.appliedDate ?? new Date().toISOString().slice(0, 10),
      columnId: (initial.columnId ?? 'applied') as ColumnId,
      workMode: initial.workMode ?? undefined, // can be undefined
      techStackInput: (initial.techStack ?? []).join(', '),
    },
  });

  useEffect(() => {
    reset({
      company: initial.company ?? '',
      role: initial.role ?? '',
      link: initial.link ?? '',
      appliedDate: initial.appliedDate ?? new Date().toISOString().slice(0, 10),
      columnId: (initial.columnId ?? 'applied') as ColumnId,
      workMode: initial.workMode ?? undefined,
      techStackInput: (initial.techStack ?? []).join(', '),
    });
  }, [initial, reset]);

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'
      onMouseDown={onClose}
      role='dialog'
      aria-modal='true'
    >
      <div
        className='w-full max-w-lg rounded-2xl bg-zinc-950 p-5 ring-1 ring-zinc-800'
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className='mb-4 flex items-start justify-between'>
          <div>
            <div className='text-lg font-semibold'>
              {mode === 'create' ? 'Add application' : 'Edit application'}
            </div>
            <div className='text-sm text-zinc-400'>
              Company, role, link, date, status.
            </div>
          </div>
          <button
            type='button'
            className='rounded-xl bg-zinc-900 px-3 py-1.5 text-sm ring-1 ring-zinc-800 hover:bg-zinc-800'
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form className='space-y-3' onSubmit={handleSubmit(onSubmit)}>
          <Field label='Company' error={errors.company?.message}>
            <input
              className='w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm ring-1 ring-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500'
              {...register('company')}
              placeholder='e.g., Stripe'
              autoFocus
            />
          </Field>

          <Field label='Role' error={errors.role?.message}>
            <input
              className='w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm ring-1 ring-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500'
              {...register('role')}
              placeholder='e.g., Senior Frontend Engineer'
            />
          </Field>

          <Field label='Link' error={errors.link?.message}>
            <input
              className='w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm ring-1 ring-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500'
              {...register('link')}
              placeholder='https://...'
            />
          </Field>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
            <Field label='Applied date' error={errors.appliedDate?.message}>
              <input
                type='date'
                className='w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm ring-1 ring-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500'
                {...register('appliedDate')}
              />
            </Field>

            <Field
              label='Status'
              error={errors.columnId?.message as string | undefined}
            >
              <select
                className='w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm ring-1 ring-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500'
                {...register('columnId')}
              >
                {COLUMN_ORDER.map((id) => (
                  <option key={id} value={id}>
                    {COLUMN_LABEL[id]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label='Work mode' error={errors.workMode?.message}>
              <select
                className='w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm ring-1 ring-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500'
                {...register('workMode', {
                  setValueAs: (v) => (v === '' ? undefined : v),
                })}
              >
                <option value=''>Any</option>
                <option value='remote'>Remote</option>
                <option value='hybrid'>Hybrid</option>
                <option value='onsite'>On-site</option>
              </select>
            </Field>

            <Field
              label='Tech stack (comma-separated)'
              error={errors.techStackInput?.message}
            >
              <input
                className='w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm ring-1 ring-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500'
                {...register('techStackInput')}
                placeholder='React, TypeScript, Next.js'
              />
            </Field>
          </div>

          <div className='flex items-center justify-end gap-2 pt-2'>
            <button
              type='button'
              className='rounded-xl bg-zinc-900 px-4 py-2 text-sm ring-1 ring-zinc-800 hover:bg-zinc-800'
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              className='rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-60'
              type='submit'
            >
              {mode === 'create' ? 'Add' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className='block'>
      <div className='mb-1 flex items-center justify-between'>
        <span className='text-xs font-medium text-zinc-200'>{label}</span>
        {error && <span className='text-xs text-red-300'>{error}</span>}
      </div>
      {children}
    </label>
  );
}
