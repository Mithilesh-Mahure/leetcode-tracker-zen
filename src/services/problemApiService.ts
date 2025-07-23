import { Problem } from '@/types/problem';

const API_URL = 'https://leetcode-tracker-zen.onrender.com';

export const ProblemApiService = {
  async getProblems(): Promise<Problem[]> {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch problems');
    return res.json();
  },

  async addProblem(problem: Omit<Problem, 'id'>): Promise<Problem> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(problem),
    });
    if (!res.ok) throw new Error('Failed to add problem');
    return res.json();
  },

  async updateProblem(id: string, updates: Partial<Problem>): Promise<Problem> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update problem');
    return res.json();
  },

  async deleteProblem(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete problem');
  },

  async addSolution(problemId: string, solution: any): Promise<any> {
    const res = await fetch(`${API_URL}/${problemId}/solutions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(solution),
    });
    if (!res.ok) throw new Error('Failed to add solution');
    return res.json();
  },
}; 