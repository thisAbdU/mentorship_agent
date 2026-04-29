import { NextResponse } from 'next/server';
import { getStudentRepoActivity } from '@/lib/github';

export async function POST(request: Request) {
  try {
    const { students, repoName } = await request.json();

    if (!students || !Array.isArray(students)) {
      return NextResponse.json({ error: 'Students array is required' }, { status: 400 });
    }

    if (!repoName) {
      return NextResponse.json({ error: 'repoName is required' }, { status: 400 });
    }

    const syncedStudents = await Promise.all(
      students.map(async (student: any) => {
        if (!student.githubUsername) {
          return { ...student, githubActivity: [], githubStatus: 'no-username' };
        }

        try {
          const activity = await getStudentRepoActivity(student.githubUsername, repoName);
          return {
            ...student,
            githubActivity: activity,
            githubStatus: activity.length > 0 ? 'connected' : 'repo-not-found',
          };
        } catch (error) {
          return {
            ...student,
            githubActivity: [],
            githubStatus: 'error',
          };
        }
      })
    );

    return NextResponse.json({ 
      success: true, 
      students: syncedStudents 
    });
  } catch (error: any) {
    console.error('Error during GitHub sync:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
