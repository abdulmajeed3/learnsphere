import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/auth';

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Public pages
import { CourseCatalogPage } from '@/pages/courses/CourseCatalogPage';
import { CourseDetailPage } from '@/pages/courses/CourseDetailPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Student pages
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { LessonViewerPage } from '@/pages/student/LessonViewerPage';
import { QuizAttemptPage } from '@/pages/student/QuizAttemptPage';
import { QuizResultPage } from '@/pages/student/QuizResultPage';

// Instructor pages
import { InstructorDashboard } from '@/pages/instructor/InstructorDashboard';
import { InstructorCoursesPage } from '@/pages/instructor/InstructorCoursesPage';
import { CourseEditorPage } from '@/pages/instructor/CourseEditorPage';
import { LessonManagerPage } from '@/pages/instructor/LessonManagerPage';
import { QuizManagerPage } from '@/pages/instructor/QuizManagerPage';

// Profile
import { ProfilePage } from '@/pages/ProfilePage';

export default function App() {
  const { isAuthenticated, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      authApi
        .me()
        .then((user) => setAuth(user, localStorage.getItem('access_token') ?? ''))
        .catch(() => clearAuth());
    }

    const handleLogout = () => clearAuth();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/courses" element={<CourseCatalogPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn/:courseId/lessons/:lessonId"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <LessonViewerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/:quizId/attempt"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <QuizAttemptPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes/:quizId/results"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <QuizResultPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/dashboard"
          element={
            <ProtectedRoute roles={['INSTRUCTOR']}>
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses"
          element={
            <ProtectedRoute roles={['INSTRUCTOR']}>
              <InstructorCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/new"
          element={
            <ProtectedRoute roles={['INSTRUCTOR']}>
              <CourseEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/:courseId/edit"
          element={
            <ProtectedRoute roles={['INSTRUCTOR']}>
              <CourseEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/:courseId/lessons"
          element={
            <ProtectedRoute roles={['INSTRUCTOR']}>
              <LessonManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/courses/:courseId/quizzes"
          element={
            <ProtectedRoute roles={['INSTRUCTOR']}>
              <QuizManagerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
