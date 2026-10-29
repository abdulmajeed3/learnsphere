import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { coursesApi } from '@/api/courses';
import { categoriesApi } from '@/api/categories';
import { CourseCard } from '@/components/ui/CourseCard';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Difficulty } from '@/types';

const DIFFICULTIES: { value: Difficulty | ''; label: string }[] = [
  { value: '', label: 'All Levels' },
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

export function CourseCatalogPage() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['courses', { search, categoryId, difficulty, page }],
    queryFn: () => coursesApi.list({ search: search || undefined, categoryId: categoryId || undefined, difficulty: (difficulty || undefined) as Difficulty | undefined, page, limit: 12 }),
    placeholderData: keepPreviousData,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Catalog</h1>
        <p className="text-gray-500">Discover courses taught by expert instructors</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 min-w-64 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </form>

        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
          className="input max-w-48"
        >
          <option value="">All Categories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={difficulty}
          onChange={(e) => { setDifficulty(e.target.value as Difficulty | ''); setPage(1); }}
          className="input max-w-44"
        >
          {DIFFICULTIES.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : !data?.data.length ? (
        <EmptyState title="No courses found" description="Try adjusting your search or filters." />
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-500">{data.meta.total} course{data.meta.total !== 1 ? 's' : ''} found</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.data.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {data.meta.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm"
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {page} of {data.meta.totalPages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page === data.meta.totalPages}
                className="btn-secondary text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
