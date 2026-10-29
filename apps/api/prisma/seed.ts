import { PrismaClient, Role, CourseStatus, Difficulty, LessonType } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  await prisma.quizAttemptAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizOption.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.courseCategory.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await argon2.hash('password123');

  const [cat1, cat2] = await Promise.all([
    prisma.courseCategory.create({ data: { name: 'Web Development', slug: 'web-development', description: 'HTML, CSS, JavaScript, React, Node.js and more' } }),
    prisma.courseCategory.create({ data: { name: 'Data Science', slug: 'data-science', description: 'Python, ML, statistics, and data analysis' } }),
  ]);

  const [instructor1, instructor2, student1, student2] = await Promise.all([
    prisma.user.create({ data: { email: 'instructor@learnsphere.dev', name: 'Alex Johnson', passwordHash, role: Role.INSTRUCTOR, bio: 'Senior full-stack developer with 10 years of experience.' } }),
    prisma.user.create({ data: { email: 'jane@learnsphere.dev', name: 'Jane Smith', passwordHash, role: Role.INSTRUCTOR, bio: 'Data scientist and ML engineer.' } }),
    prisma.user.create({ data: { email: 'student@learnsphere.dev', name: 'Sam Williams', passwordHash, role: Role.STUDENT } }),
    prisma.user.create({ data: { email: 'bob@learnsphere.dev', name: 'Bob Chen', passwordHash, role: Role.STUDENT } }),
  ]);

  const course1 = await prisma.course.create({
    data: {
      title: 'Complete React Development Bootcamp',
      slug: 'complete-react-development-bootcamp',
      description: 'Master React from scratch. Learn hooks, context, performance optimization, and build real-world applications.',
      shortDescription: 'Master React from scratch with hands-on projects.',
      status: CourseStatus.PUBLISHED,
      difficulty: Difficulty.BEGINNER,
      objectives: ['Understand React fundamentals', 'Build real-world apps', 'Master hooks and context', 'Deploy applications'],
      instructorId: instructor1.id,
      categoryId: cat1.id,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'Advanced TypeScript Patterns',
      slug: 'advanced-typescript-patterns',
      description: 'Deep dive into TypeScript generics, decorators, mapped types, and advanced design patterns for enterprise applications.',
      shortDescription: 'Deep dive into TypeScript for enterprise development.',
      status: CourseStatus.PUBLISHED,
      difficulty: Difficulty.ADVANCED,
      objectives: ['Master TypeScript generics', 'Use advanced type utilities', 'Implement design patterns', 'Write type-safe APIs'],
      instructorId: instructor1.id,
      categoryId: cat1.id,
    },
  });

  const course3 = await prisma.course.create({
    data: {
      title: 'Node.js Microservices (Draft)',
      slug: 'nodejs-microservices-draft',
      description: 'Build scalable microservices with Node.js, Docker, and Kubernetes.',
      shortDescription: 'Build scalable microservices with Node.js.',
      status: CourseStatus.DRAFT,
      difficulty: Difficulty.INTERMEDIATE,
      objectives: ['Understand microservices architecture', 'Build services with Node.js'],
      instructorId: instructor1.id,
      categoryId: cat1.id,
    },
  });

  const course4 = await prisma.course.create({
    data: {
      title: 'Python for Data Science',
      slug: 'python-for-data-science',
      description: 'Learn Python, NumPy, Pandas, Matplotlib, and Scikit-learn for data analysis and machine learning.',
      shortDescription: 'Learn Python and key data science libraries.',
      status: CourseStatus.PUBLISHED,
      difficulty: Difficulty.BEGINNER,
      objectives: ['Python fundamentals for data science', 'Data manipulation with Pandas', 'Visualization with Matplotlib', 'Intro to ML with Scikit-learn'],
      instructorId: instructor2.id,
      categoryId: cat2.id,
    },
  });

  const course5 = await prisma.course.create({
    data: {
      title: 'Machine Learning Fundamentals',
      slug: 'machine-learning-fundamentals',
      description: 'Comprehensive introduction to ML algorithms, model evaluation, feature engineering, and practical implementation.',
      shortDescription: 'Comprehensive intro to ML algorithms and applications.',
      status: CourseStatus.PUBLISHED,
      difficulty: Difficulty.INTERMEDIATE,
      objectives: ['Understand ML algorithms', 'Feature engineering', 'Model evaluation', 'Practical implementation'],
      instructorId: instructor2.id,
      categoryId: cat2.id,
    },
  });

  const lessons1 = await Promise.all([
    prisma.lesson.create({ data: { title: 'Introduction to React', content: '# Introduction to React\n\nReact is a JavaScript library for building user interfaces...', type: LessonType.TEXT, order: 1, duration: 15, courseId: course1.id } }),
    prisma.lesson.create({ data: { title: 'Setting Up Your Environment', videoUrl: 'https://www.youtube.com/watch?v=example1', type: LessonType.VIDEO, order: 2, duration: 20, courseId: course1.id } }),
    prisma.lesson.create({ data: { title: 'JSX and Components', content: '# JSX and Components\n\nJSX is a syntax extension for JavaScript...', type: LessonType.TEXT, order: 3, duration: 25, courseId: course1.id } }),
    prisma.lesson.create({ data: { title: 'State and Props', videoUrl: 'https://www.youtube.com/watch?v=example2', type: LessonType.VIDEO, order: 4, duration: 30, courseId: course1.id } }),
    prisma.lesson.create({ data: { title: 'React Hooks Deep Dive', content: '# React Hooks\n\nHooks let you use state and other React features in function components...', type: LessonType.TEXT, order: 5, duration: 45, courseId: course1.id } }),
  ]);

  const lessons4 = await Promise.all([
    prisma.lesson.create({ data: { title: 'Python Basics', content: '# Python Basics\n\nPython is a high-level, interpreted programming language...', type: LessonType.TEXT, order: 1, duration: 20, courseId: course4.id } }),
    prisma.lesson.create({ data: { title: 'NumPy Arrays', videoUrl: 'https://www.youtube.com/watch?v=example3', type: LessonType.VIDEO, order: 2, duration: 25, courseId: course4.id } }),
    prisma.lesson.create({ data: { title: 'Data Analysis with Pandas', content: '# Pandas DataFrames\n\nPandas is a powerful data manipulation library...', type: LessonType.TEXT, order: 3, duration: 35, courseId: course4.id } }),
    prisma.lesson.create({ data: { title: 'Data Visualization', videoUrl: 'https://www.youtube.com/watch?v=example4', type: LessonType.VIDEO, order: 4, duration: 30, courseId: course4.id } }),
  ]);

  await Promise.all([
    prisma.lesson.create({ data: { title: 'TypeScript Generics', content: '# Generics\n\nGenerics allow you to write flexible, reusable functions...', type: LessonType.TEXT, order: 1, duration: 30, courseId: course2.id } }),
    prisma.lesson.create({ data: { title: 'Mapped Types', videoUrl: 'https://www.youtube.com/watch?v=example5', type: LessonType.VIDEO, order: 2, duration: 25, courseId: course2.id } }),
    prisma.lesson.create({ data: { title: 'Conditional Types', content: '# Conditional Types\n\nConditional types select one of two possible types...', type: LessonType.TEXT, order: 3, duration: 35, courseId: course2.id } }),
  ]);

  await Promise.all([
    prisma.lesson.create({ data: { title: 'Intro to ML', content: '# Machine Learning Overview\n\nMachine learning is a subset of AI...', type: LessonType.TEXT, order: 1, duration: 20, courseId: course5.id } }),
    prisma.lesson.create({ data: { title: 'Linear Regression', videoUrl: 'https://www.youtube.com/watch?v=example6', type: LessonType.VIDEO, order: 2, duration: 40, courseId: course5.id } }),
    prisma.lesson.create({ data: { title: 'Classification Algorithms', content: '# Classification\n\nClassification is supervised learning with categorical output...', type: LessonType.TEXT, order: 3, duration: 35, courseId: course5.id } }),
  ]);

  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'React Fundamentals Quiz',
      description: 'Test your knowledge of React basics',
      courseId: course1.id,
    },
  });

  const q1 = await prisma.quizQuestion.create({ data: { text: 'What is React?', order: 1, quizId: quiz1.id } });
  await Promise.all([
    prisma.quizOption.create({ data: { text: 'A JavaScript library for building UIs', isCorrect: true, questionId: q1.id } }),
    prisma.quizOption.create({ data: { text: 'A CSS framework', isCorrect: false, questionId: q1.id } }),
    prisma.quizOption.create({ data: { text: 'A database', isCorrect: false, questionId: q1.id } }),
    prisma.quizOption.create({ data: { text: 'A server-side language', isCorrect: false, questionId: q1.id } }),
  ]);

  const q2 = await prisma.quizQuestion.create({ data: { text: 'Which hook is used for side effects in React?', order: 2, quizId: quiz1.id } });
  await Promise.all([
    prisma.quizOption.create({ data: { text: 'useEffect', isCorrect: true, questionId: q2.id } }),
    prisma.quizOption.create({ data: { text: 'useState', isCorrect: false, questionId: q2.id } }),
    prisma.quizOption.create({ data: { text: 'useContext', isCorrect: false, questionId: q2.id } }),
    prisma.quizOption.create({ data: { text: 'useRef', isCorrect: false, questionId: q2.id } }),
  ]);

  const q3 = await prisma.quizQuestion.create({ data: { text: 'What does JSX stand for?', order: 3, quizId: quiz1.id } });
  await Promise.all([
    prisma.quizOption.create({ data: { text: 'JavaScript XML', isCorrect: true, questionId: q3.id } }),
    prisma.quizOption.create({ data: { text: 'Java Syntax Extension', isCorrect: false, questionId: q3.id } }),
    prisma.quizOption.create({ data: { text: 'JSON Exchange', isCorrect: false, questionId: q3.id } }),
    prisma.quizOption.create({ data: { text: 'JavaScript Extension', isCorrect: false, questionId: q3.id } }),
  ]);

  const quiz4 = await prisma.quiz.create({
    data: {
      title: 'Python Data Science Quiz',
      description: 'Test your Python and data science knowledge',
      courseId: course4.id,
    },
  });

  const q4 = await prisma.quizQuestion.create({ data: { text: 'Which library is used for data manipulation in Python?', order: 1, quizId: quiz4.id } });
  await Promise.all([
    prisma.quizOption.create({ data: { text: 'Pandas', isCorrect: true, questionId: q4.id } }),
    prisma.quizOption.create({ data: { text: 'NumPy', isCorrect: false, questionId: q4.id } }),
    prisma.quizOption.create({ data: { text: 'Matplotlib', isCorrect: false, questionId: q4.id } }),
    prisma.quizOption.create({ data: { text: 'Scikit-learn', isCorrect: false, questionId: q4.id } }),
  ]);

  const q5 = await prisma.quizQuestion.create({ data: { text: 'What is a Pandas DataFrame?', order: 2, quizId: quiz4.id } });
  await Promise.all([
    prisma.quizOption.create({ data: { text: 'A 2D labeled data structure', isCorrect: true, questionId: q5.id } }),
    prisma.quizOption.create({ data: { text: 'A 1D array', isCorrect: false, questionId: q5.id } }),
    prisma.quizOption.create({ data: { text: 'A database table', isCorrect: false, questionId: q5.id } }),
    prisma.quizOption.create({ data: { text: 'A neural network layer', isCorrect: false, questionId: q5.id } }),
  ]);

  const enrollment1 = await prisma.enrollment.create({ data: { studentId: student1.id, courseId: course1.id } });
  const enrollment2 = await prisma.enrollment.create({ data: { studentId: student1.id, courseId: course4.id } });
  await prisma.enrollment.create({ data: { studentId: student2.id, courseId: course1.id } });

  await Promise.all([
    prisma.lessonProgress.create({ data: { enrollmentId: enrollment1.id, lessonId: lessons1[0].id } }),
    prisma.lessonProgress.create({ data: { enrollmentId: enrollment1.id, lessonId: lessons1[1].id } }),
    prisma.lessonProgress.create({ data: { enrollmentId: enrollment1.id, lessonId: lessons1[2].id } }),
    prisma.lessonProgress.create({ data: { enrollmentId: enrollment2.id, lessonId: lessons4[0].id } }),
    prisma.lessonProgress.create({ data: { enrollmentId: enrollment2.id, lessonId: lessons4[1].id } }),
  ]);

  console.log('✅ Seed complete!');
  console.log('Demo accounts:');
  console.log('  Instructor: instructor@learnsphere.dev / password123');
  console.log('  Instructor: jane@learnsphere.dev / password123');
  console.log('  Student: student@learnsphere.dev / password123');
  console.log('  Student: bob@learnsphere.dev / password123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
