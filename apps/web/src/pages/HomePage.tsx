import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, ArrowRight } from 'lucide-react';

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Learn anything, <br />at your own pace
          </h1>
          <p className="text-lg text-primary-200 mb-8 max-w-2xl mx-auto">
            LearnSphere connects students with expert instructors. Explore thousands of courses
            and build real skills that advance your career.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/courses" className="bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-2">
              Browse Courses <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/register" className="border border-white/30 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
              Start Teaching
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: 'Quality Courses', desc: 'Expert-crafted courses with text and video lessons.' },
              { icon: Users, title: 'Great Instructors', desc: 'Learn from experienced professionals in their fields.' },
              { icon: Award, title: 'Track Progress', desc: 'Monitor your progress and complete quizzes as you learn.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
                  <Icon className="h-7 w-7 text-primary-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to start learning?</h2>
          <p className="text-gray-500 mb-8">Join thousands of students already on LearnSphere.</p>
          <Link to="/register" className="btn-primary text-base px-8 py-3">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}
