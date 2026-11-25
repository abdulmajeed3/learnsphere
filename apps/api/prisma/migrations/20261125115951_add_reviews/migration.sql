-- CreateTable
CREATE TABLE "CourseReview" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "body" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "CourseReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseReview_courseId_idx" ON "CourseReview"("courseId");

-- CreateIndex
CREATE INDEX "CourseReview_studentId_idx" ON "CourseReview"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseReview_studentId_courseId_key" ON "CourseReview"("studentId", "courseId");

-- AddForeignKey
ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
