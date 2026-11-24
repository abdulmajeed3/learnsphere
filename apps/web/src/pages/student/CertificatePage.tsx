import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Award, Printer, ExternalLink } from 'lucide-react';
import { certificatesApi } from '@/api/certificates';
import { PageSpinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';

export function CertificatePage() {
  const { code } = useParams<{ code: string }>();

  const {
    data: cert,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['certificate', code],
    queryFn: () => certificatesApi.verify(code!),
    enabled: !!code,
  });

  if (isLoading) return <PageSpinner />;
  if (error || !cert)
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <Alert message="Certificate not found or invalid code." />
        <Link to="/courses" className="btn-primary mt-4 inline-flex">
          Browse Courses
        </Link>
      </div>
    );

  const issueDate = new Date(cert.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Actions */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link to="/student/dashboard" className="btn-secondary text-sm">
          ← Dashboard
        </Link>
        <button onClick={() => window.print()} className="btn-primary text-sm">
          <Printer className="h-4 w-4" /> Print Certificate
        </button>
      </div>

      {/* Certificate */}
      <div
        className="relative bg-white border-8 border-double border-primary-600 rounded-2xl p-10 sm:p-16 text-center shadow-xl print:border-[6px] print:shadow-none"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {/* Decorative corners */}
        <div className="absolute top-4 left-4 h-8 w-8 border-t-4 border-l-4 border-primary-400 rounded-tl-lg" />
        <div className="absolute top-4 right-4 h-8 w-8 border-t-4 border-r-4 border-primary-400 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 h-8 w-8 border-b-4 border-l-4 border-primary-400 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 h-8 w-8 border-b-4 border-r-4 border-primary-400 rounded-br-lg" />

        {/* Logo / badge */}
        <div className="flex justify-center mb-6">
          <div className="bg-primary-600 text-white rounded-full p-5">
            <Award className="h-12 w-12" />
          </div>
        </div>

        <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">
          LearnSphere certifies that
        </p>

        <h1
          className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {cert.student?.name}
        </h1>

        <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">
          has successfully completed
        </p>

        <h2 className="text-2xl sm:text-3xl font-semibold text-primary-700 mb-6">
          {cert.course.title}
        </h2>

        <div className="flex justify-center gap-1 text-sm text-gray-500 mb-8">
          <span>Taught by</span>
          <span className="font-medium text-gray-700">{cert.course.instructor?.name}</span>
        </div>

        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div>
            <p className="font-medium text-gray-700">{issueDate}</p>
            <p>Date of Completion</p>
          </div>
          <div className="text-center">
            <div className="inline-block bg-gray-100 rounded-lg px-4 py-2 font-mono text-xs text-gray-600 break-all">
              {cert.code}
            </div>
            <p className="mt-1">Verification Code</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-700">LearnSphere</p>
            <p>Online Learning Platform</p>
          </div>
        </div>
      </div>

      {/* Verification note */}
      <div className="mt-6 text-center text-sm text-gray-500 print:hidden">
        <p>
          Verify this certificate at{' '}
          <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
            /certificates/{cert.code}
          </span>
        </p>
      </div>
    </div>
  );
}
