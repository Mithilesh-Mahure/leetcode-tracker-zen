export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string[];
  tags: string[];
  url?: string;
  description?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  solutions: Solution[];
  attempts: number;
  solved: boolean;
  firstSolvedAt?: Date;
  lastSolvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Solution {
  id: string;
  problemId: string;
  language: string;
  code: string;
  runtime?: number;
  memory?: number;
  beats?: number;
  explanation?: string;
  approach: string;
  timeComplexity: string;
  spaceComplexity: string;
  githubUrl?: string;
  createdAt: Date;
}

export interface StudySession {
  id: string;
  date: Date;
  problemsSolved: string[];
  timeSpent: number; // in minutes
  notes?: string;
}

export interface ProblemFilter {
  difficulty?: ('Easy' | 'Medium' | 'Hard')[];
  categories?: string[];
  tags?: string[];
  solved?: boolean;
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ProgressStats {
  totalProblems: number;
  solvedProblems: number;
  easyProblems: number;
  mediumProblems: number;
  hardProblems: number;
  currentStreak: number;
  longestStreak: number;
  weeklyProgress: number[];
  categoryProgress: Record<string, number>;
  averageTime: number;
  recentActivity: StudySession[];
}