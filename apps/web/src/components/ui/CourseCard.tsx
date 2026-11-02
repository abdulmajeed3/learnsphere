import { Link } from 'react-router-dom';
import { BookOpen, Users, Bookmark } from 'lucide-react';
import type { Course } from '@/types';
import { ProgressBar } from './ProgressBar';

const difficultyColors = {
  BEGINNER: 'badge-green',
  INTERMEDIATE: 'badge-yellow',
  ADVANCED: 'badge-red',
} as const;

interface CourseCardProps {
  course: Course;
  progress?: { progressPercentage: number; completedLessons: number; totalLessons: number };
  href?: string;
  isBookmarked?: boolean;
  onBookmarkToggle?: (e: React.MouseEvent) => void;
}

export function CourseCard({
  course,
  progress,
  href,
  isBookmarked,
  onBookmarkToggle,
}: CourseCardProps) {
  const link = href ?? `/courses/${course.id}`;
  return (
    <Link to={link} className="card block overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-40 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
        {onBookmarkToggle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBookmarkToggle(e);
            }}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark course'}
            className={`absolute top-2 right-2 rounded-full p-1.5 transition-colors ${
              isBookmarked
                ? 'bg-white/90 text-primary-600 hover:bg-white'
                : 'bg-black/20 text-white/80 hover:bg-black/40'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        )}
        <BookOpen className="h-12 w-12 text-white/70" />
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-start gap-2">
          <span className={`${difficultyColors[course.difficulty]} shrink-0`}>
            {course.difficulty.charAt(0) + course.difficulty.slice(1).toLowerCase()}
          </span>
          {course.category && <span className="badge-blue truncate">{course.category.name}</span>}
        </div>
        <h3 className="mb-1 font-semibold text-gray-900 group-hover:text-primary-700 line-clamp-2 leading-snug">
          {course.title}
        </h3>
        <p className="mb-3 text-xs text-gray-500 line-clamp-2">
          {course.shortDescription ?? course.description}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {course._count?.lessons ?? 0} lessons
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {course._count?.enrollments ?? 0}
          </span>
        </div>
        {course.instructor && (
          <p className="mt-2 text-xs text-gray-500">by {course.instructor.name}</p>
        )}
        {progress && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <div className="mb-1 flex justify-between text-xs text-gray-500">
              <span>
                {progress.completedLessons}/{progress.totalLessons} lessons
              </span>
              <span>{progress.progressPercentage}%</span>
            </div>
            <ProgressBar value={progress.progressPercentage} size="sm" />
          </div>
        )}
      </div>
    </Link>
  );
}
