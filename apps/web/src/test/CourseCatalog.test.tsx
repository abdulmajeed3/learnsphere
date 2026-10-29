import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CourseCatalogPage } from '@/pages/courses/CourseCatalogPage';

vi.mock('@/api/courses', () => ({
  coursesApi: {
    list: vi.fn().mockResolvedValue({
      data: [
        {
          id: '1',
          title: 'React Course',
          slug: 'react',
          description: 'Learn React',
          status: 'PUBLISHED',
          difficulty: 'BEGINNER',
          objectives: [],
          _count: { lessons: 5, enrollments: 10 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          instructor: { id: 'i1', name: 'Alice' },
        },
      ],
      meta: { total: 1, page: 1, limit: 12, totalPages: 1 },
    }),
  },
}));

vi.mock('@/api/categories', () => ({
  categoriesApi: { list: vi.fn().mockResolvedValue([]) },
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <CourseCatalogPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('CourseCatalogPage', () => {
  it('renders heading', () => {
    renderPage();
    expect(screen.getByText(/course catalog/i)).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderPage();
    expect(screen.getByPlaceholderText(/search courses/i)).toBeInTheDocument();
  });
});
