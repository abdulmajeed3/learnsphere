import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  BookOpen,
  StickyNote,
  Pencil,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { lessonsApi } from '@/api/lessons';
import { progressApi } from '@/api/progress';
import { coursesApi } from '@/api/courses';
import { notesApi } from '@/api/notes';
import { PageSpinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import type { LessonNote } from '@/types';

export function LessonViewerPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.get(courseId!),
  });

  const { data: lessons } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => lessonsApi.list(courseId!),
  });

  const {
    data: lesson,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lesson', courseId, lessonId],
    queryFn: () => lessonsApi.get(courseId!, lessonId!),
  });

  const { data: progress } = useQuery({
    queryKey: ['course-progress', courseId],
    queryFn: () => progressApi.getCourseProgress(courseId!),
  });

  const markComplete = useMutation({
    mutationFn: () => progressApi.markComplete(lessonId!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course-progress', courseId] }),
  });

  const markIncomplete = useMutation({
    mutationFn: () => progressApi.markIncomplete(lessonId!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course-progress', courseId] }),
  });

  const { data: notes } = useQuery({
    queryKey: ['lesson-notes', lessonId],
    queryFn: () => notesApi.list(lessonId!),
    enabled: !!lessonId,
  });

  const createNote = useMutation({
    mutationFn: (content: string) => notesApi.create(lessonId!, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lesson-notes', lessonId] });
      setNewNote('');
    },
  });

  const updateNote = useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) =>
      notesApi.update(noteId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lesson-notes', lessonId] });
      setEditingId(null);
    },
  });

  const deleteNote = useMutation({
    mutationFn: (noteId: string) => notesApi.delete(noteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lesson-notes', lessonId] }),
  });

  const startEdit = (note: LessonNote) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  if (isLoading) return <PageSpinner />;
  if (error || !lesson)
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Alert message="Lesson not found." />
      </div>
    );

  const isCompleted = progress?.completedLessonIds.includes(lessonId!);
  const currentIndex = lessons?.findIndex((l) => l.id === lessonId) ?? -1;
  const prevLesson = lessons?.[currentIndex - 1];
  const nextLesson = lessons?.[currentIndex + 1];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar: lesson list */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="card overflow-hidden">
            <div className="border-b border-gray-100 px-4 py-3">
              <Link
                to={`/courses/${courseId}`}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> {course?.title}
              </Link>
            </div>
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {lessons?.map((l, i) => {
                const done = progress?.completedLessonIds.includes(l.id);
                const active = l.id === lessonId;
                return (
                  <Link
                    key={l.id}
                    to={`/learn/${courseId}/lessons/${l.id}`}
                    className={`flex items-center gap-3 px-4 py-3 text-sm border-b border-gray-50 hover:bg-gray-50 transition-colors ${active ? 'bg-primary-50 border-l-2 border-l-primary-600' : ''}`}
                  >
                    {done ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <Circle
                        className={`h-4 w-4 shrink-0 ${active ? 'text-primary-500' : 'text-gray-300'}`}
                      />
                    )}
                    <span
                      className={`flex-1 truncate ${active ? 'font-medium text-primary-700' : 'text-gray-600'}`}
                    >
                      {i + 1}. {l.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">
                Lesson {currentIndex + 1} of {lessons?.length}
              </p>
              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
            </div>
            <button
              onClick={() => (isCompleted ? markIncomplete.mutate() : markComplete.mutate())}
              disabled={markComplete.isPending || markIncomplete.isPending}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isCompleted
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-700'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="h-4 w-4" /> Completed
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4" /> Mark Complete
                </>
              )}
            </button>
          </div>

          <div className="card p-6 mb-4">
            {lesson.type === 'VIDEO' && lesson.videoUrl ? (
              <div>
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                  <PlayCircle className="h-4 w-4 text-primary-500" /> Video Lesson
                </div>
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center text-white">
                    <PlayCircle className="h-16 w-16 mx-auto mb-3 opacity-60" />
                    <p className="text-sm opacity-70">External video lesson</p>
                    <a
                      href={lesson.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                      Open Video
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                  <BookOpen className="h-4 w-4" /> Text Lesson
                </div>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {lesson.content ?? 'No content available.'}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {prevLesson ? (
              <Link
                to={`/learn/${courseId}/lessons/${prevLesson.id}`}
                className="btn-secondary text-sm"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Link>
            ) : (
              <div />
            )}
            {nextLesson ? (
              <Link
                to={`/learn/${courseId}/lessons/${nextLesson.id}`}
                className="btn-primary text-sm"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link to={`/courses/${courseId}`} className="btn-secondary text-sm">
                Back to Course
              </Link>
            )}
          </div>

          {/* Notes */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <StickyNote className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">My Notes</h2>
            </div>

            <div className="card p-4 mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write a note for this lesson..."
                rows={3}
                className="input resize-none mb-2"
              />
              <button
                onClick={() => newNote.trim() && createNote.mutate(newNote.trim())}
                disabled={createNote.isPending || !newNote.trim()}
                className="btn-primary text-sm"
              >
                {createNote.isPending ? 'Saving...' : 'Save Note'}
              </button>
            </div>

            {notes?.length ? (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="card p-4">
                    {editingId === note.id ? (
                      <>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          className="input resize-none mb-2"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              editContent.trim() &&
                              updateNote.mutate({ noteId: note.id, content: editContent.trim() })
                            }
                            disabled={updateNote.isPending}
                            className="btn-primary text-xs"
                          >
                            <Check className="h-3.5 w-3.5" /> Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="btn-secondary text-xs"
                          >
                            <X className="h-3.5 w-3.5" /> Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => startEdit(note)}
                            className="btn-ghost text-xs px-2 py-1"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => deleteNote.mutate(note.id)}
                            disabled={deleteNote.isPending}
                            className="btn-ghost text-xs px-2 py-1 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                No notes yet for this lesson.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
