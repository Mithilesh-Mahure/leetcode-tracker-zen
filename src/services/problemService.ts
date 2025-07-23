import { Problem, Solution, ProblemFilter, ProgressStats, StudySession } from '@/types/problem';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'leetcode_problems';
const SESSIONS_KEY = 'study_sessions';

export class ProblemService {
  static getProblems(): Problem[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored).map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
      firstSolvedAt: p.firstSolvedAt ? new Date(p.firstSolvedAt) : undefined,
      lastSolvedAt: p.lastSolvedAt ? new Date(p.lastSolvedAt) : undefined,
      solutions: p.solutions?.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt)
      })) || []
    }));
  }

  static saveProblems(problems: Problem[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
  }

  static addProblem(problemData: Omit<Problem, 'id' | 'createdAt' | 'updatedAt' | 'attempts' | 'solved' | 'solutions'>): Problem {
    const problems = this.getProblems();
    const newProblem: Problem = {
      ...problemData,
      id: uuidv4(),
      attempts: 0,
      solved: false,
      solutions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    problems.push(newProblem);
    this.saveProblems(problems);
    return newProblem;
  }

  static updateProblem(id: string, updates: Partial<Problem>): Problem | null {
    const problems = this.getProblems();
    const index = problems.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    problems[index] = {
      ...problems[index],
      ...updates,
      updatedAt: new Date()
    };
    
    this.saveProblems(problems);
    return problems[index];
  }

  static deleteProblem(id: string): boolean {
    const problems = this.getProblems();
    const filtered = problems.filter(p => p.id !== id);
    
    if (filtered.length === problems.length) return false;
    
    this.saveProblems(filtered);
    return true;
  }

  static addSolution(problemId: string, solutionData: Omit<Solution, 'id' | 'problemId' | 'createdAt'>): Solution | null {
    const problems = this.getProblems();
    const problem = problems.find(p => p.id === problemId);
    
    if (!problem) return null;
    
    const newSolution: Solution = {
      ...solutionData,
      id: uuidv4(),
      problemId,
      createdAt: new Date()
    };
    
    problem.solutions.push(newSolution);
    problem.solved = true;
    problem.attempts += 1;
    if (!problem.firstSolvedAt) {
      problem.firstSolvedAt = new Date();
    }
    problem.lastSolvedAt = new Date();
    problem.updatedAt = new Date();
    
    this.saveProblems(problems);
    return newSolution;
  }

  static filterProblems(problems: Problem[], filter: ProblemFilter): Problem[] {
    return problems.filter(problem => {
      if (filter.difficulty && !filter.difficulty.includes(problem.difficulty)) {
        return false;
      }
      
      if (filter.categories && filter.categories.length > 0) {
        const hasCategory = filter.categories.some(cat => 
          problem.category.some(pCat => pCat.toLowerCase().includes(cat.toLowerCase()))
        );
        if (!hasCategory) return false;
      }
      
      if (filter.tags && filter.tags.length > 0) {
        const hasTag = filter.tags.some(tag => 
          problem.tags.some(pTag => pTag.toLowerCase().includes(tag.toLowerCase()))
        );
        if (!hasTag) return false;
      }
      
      if (filter.solved !== undefined && problem.solved !== filter.solved) {
        return false;
      }
      
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const matchesSearch = 
          problem.title.toLowerCase().includes(searchLower) ||
          problem.description?.toLowerCase().includes(searchLower) ||
          problem.notes?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      if (filter.dateRange) {
        const problemDate = problem.lastSolvedAt || problem.createdAt;
        if (problemDate < filter.dateRange.start || problemDate > filter.dateRange.end) {
          return false;
        }
      }
      
      return true;
    });
  }

  static getProgressStats(): ProgressStats {
    const problems = this.getProblems();
    const sessions = this.getStudySessions();
    
    const totalProblems = problems.length;
    const solvedProblems = problems.filter(p => p.solved).length;
    const easyProblems = problems.filter(p => p.difficulty === 'Easy').length;
    const mediumProblems = problems.filter(p => p.difficulty === 'Medium').length;
    const hardProblems = problems.filter(p => p.difficulty === 'Hard').length;
    
    // Calculate streaks
    const sortedSessions = sessions.sort((a, b) => b.date.getTime() - a.date.getTime());
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    let checkDate = new Date(today);
    
    // Calculate current streak
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.date);
      const daysDiff = Math.floor((checkDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 1) {
        currentStreak++;
        tempStreak++;
        checkDate = sessionDate;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    for (let i = 0; i < sortedSessions.length; i++) {
      tempStreak = 1;
      let currentDate = new Date(sortedSessions[i].date);
      
      for (let j = i + 1; j < sortedSessions.length; j++) {
        const nextDate = new Date(sortedSessions[j].date);
        const daysDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          tempStreak++;
          currentDate = nextDate;
        } else {
          break;
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
    }
    
    // Weekly progress (last 7 days)
    const weeklyProgress = Array(7).fill(0);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    sessions.forEach(session => {
      if (session.date >= lastWeek) {
        const dayIndex = Math.floor((today.getTime() - session.date.getTime()) / (1000 * 60 * 60 * 24));
        if (dayIndex < 7) {
          weeklyProgress[6 - dayIndex] += session.problemsSolved.length;
        }
      }
    });
    
    // Category progress
    const categoryProgress: Record<string, number> = {};
    problems.forEach(problem => {
      problem.category.forEach(cat => {
        categoryProgress[cat] = (categoryProgress[cat] || 0) + (problem.solved ? 1 : 0);
      });
    });
    
    // Average time calculation
    const totalTime = sessions.reduce((sum, session) => sum + session.timeSpent, 0);
    const averageTime = sessions.length > 0 ? totalTime / sessions.length : 0;
    
    return {
      totalProblems,
      solvedProblems,
      easyProblems,
      mediumProblems,
      hardProblems,
      currentStreak,
      longestStreak,
      weeklyProgress,
      categoryProgress,
      averageTime,
      recentActivity: sessions.slice(0, 10)
    };
  }

  static getStudySessions(): StudySession[] {
    const stored = localStorage.getItem(SESSIONS_KEY);
    if (!stored) return [];
    
    return JSON.parse(stored).map((s: any) => ({
      ...s,
      date: new Date(s.date)
    }));
  }

  static addStudySession(session: Omit<StudySession, 'id'>): StudySession {
    const sessions = this.getStudySessions();
    const newSession: StudySession = {
      ...session,
      id: uuidv4()
    };
    
    sessions.push(newSession);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    return newSession;
  }

  static exportData(): string {
    const problems = this.getProblems();
    const sessions = this.getStudySessions();
    
    return JSON.stringify({
      problems,
      sessions,
      exportDate: new Date(),
      version: '1.0'
    }, null, 2);
  }

  static importData(jsonData: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.problems || !Array.isArray(data.problems)) {
        return { success: false, message: 'Invalid data format: missing problems array' };
      }
      
      // Validate problem structure
      const validProblems = data.problems.filter((p: any) => 
        p.id && p.title && p.difficulty && Array.isArray(p.category)
      );
      
      if (validProblems.length !== data.problems.length) {
        return { success: false, message: 'Some problems have invalid structure' };
      }
      
      this.saveProblems(validProblems);
      
      if (data.sessions && Array.isArray(data.sessions)) {
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(data.sessions));
      }
      
      return { success: true, message: `Imported ${validProblems.length} problems successfully` };
    } catch (error) {
      return { success: false, message: 'Invalid JSON format' };
    }
  }
}