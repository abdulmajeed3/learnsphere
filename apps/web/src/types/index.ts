export type Role = 'STUDENT' | 'INSTRUCTOR';
export type CourseStatus = 'DRAFT' | 'PUBLISHED';
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type LessonType = 'TEXT' | 'VIDEO';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  status: CourseStatus;
  difficulty: Difficulty;
  objectives: string[];
  instructorId: string;
  categoryId?: string;
  instructor?: Pick<User, 'id' | 'name' | 'bio' | 'avatarUrl'>;
  category?: Category;
  lessons?: Lesson[];
  quizzes?: { id: string; title: string }[];
  _count?: { enrollments: number; lessons?: number };
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  type: LessonType;
  order: number;
  duration?: number;
  courseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  enrolledAt: string;
  studentId: string;
  courseId: string;
  course: Course;
  completedLessons?: number;
  totalLessons?: number;
  progressPercentage?: number;
}

export interface LessonProgress {
  id: string;
  lessonId: string;
  enrollmentId: string;
  completedAt: string;
}

export interface CourseProgress {
  enrollmentId: string;
  courseId: string;
  completedLessonIds: string[];
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  questions?: QuizQuestion[];
  _count?: { questions: number; attempts: number };
}

export interface QuizQuestion {
  id: string;
  text: string;
  order: number;
  quizId: string;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface QuizAttempt {
  id: string;
  score: number;
  totalPoints: number;
  percentageScore: number;
  submittedAt: string;
  quizId: string;
  studentId: string;
  answers: QuizAttemptAnswer[];
}

export interface QuizAttemptAnswer {
  id: string;
  isCorrect: boolean;
  questionId: string;
  selectedOptionId?: string;
  question?: { text: string };
  selectedOption?: { text: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface ApiError {
  message: string | string[];
  statusCode: number;
  error?: string;
}
