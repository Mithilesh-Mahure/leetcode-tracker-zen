import { FirecrawlService } from './firecrawlService';

export interface LeetCodeProblem {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  url: string;
  description: string;
  tags: string[];
  categories: string[];
  acceptance?: string;
  likes?: number;
  dislikes?: number;
}

export interface LeetCodeProfile {
  username: string;
  solvedProblems: number;
  totalProblems: number;
  ranking: number;
  reputation: number;
  submissions: LeetCodeSubmission[];
}

export interface LeetCodeSubmission {
  title: string;
  status: string;
  runtime: string;
  memory: string;
  language: string;
  timestamp: Date;
}

export class LeetCodeService {
  private static readonly BASE_URL = 'https://leetcode.com';
  
  static async scrapeProblem(problemUrl: string): Promise<LeetCodeProblem | null> {
    try {
      const apiKey = FirecrawlService.getApiKey();
      if (!apiKey) {
        throw new Error('Firecrawl API key not found');
      }

      const result = await FirecrawlService.crawlWebsite(problemUrl);
      
      if (!result.success || !result.data) {
        throw new Error('Failed to scrape problem');
      }

      // Parse the scraped content to extract problem details
      const content = result.data;
      
      // Extract problem title
      const titleMatch = content.toString().match(/<h1[^>]*>([^<]+)<\/h1>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';
      
      // Extract difficulty
      const difficultyMatch = content.toString().match(/difficulty[^>]*>\s*(Easy|Medium|Hard)/i);
      const difficulty = (difficultyMatch ? difficultyMatch[1] : 'Medium') as 'Easy' | 'Medium' | 'Hard';
      
      // Extract description (simplified)
      const descMatch = content.toString().match(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
      let description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : '';
      description = description.slice(0, 500) + (description.length > 500 ? '...' : '');
      
      // Extract tags (this would need more sophisticated parsing in real implementation)
      const tags = this.extractTagsFromContent(content.toString());
      const categories = this.inferCategoriesFromTags(tags);
      
      return {
        title,
        difficulty,
        url: problemUrl,
        description,
        tags,
        categories
      };
    } catch (error) {
      console.error('Error scraping LeetCode problem:', error);
      return null;
    }
  }

  static async scrapeProfile(username: string): Promise<LeetCodeProfile | null> {
    try {
      const profileUrl = `${this.BASE_URL}/${username}/`;
      const apiKey = FirecrawlService.getApiKey();
      
      if (!apiKey) {
        throw new Error('Firecrawl API key not found');
      }

      const result = await FirecrawlService.crawlWebsite(profileUrl);
      
      if (!result.success || !result.data) {
        throw new Error('Failed to scrape profile');
      }

      const content = result.data.toString();
      
      // Extract profile stats (simplified parsing)
      const solvedMatch = content.match(/solved[^>]*>\s*(\d+)/i);
      const totalMatch = content.match(/total[^>]*>\s*(\d+)/i);
      const rankingMatch = content.match(/ranking[^>]*>\s*(\d+)/i);
      
      const solvedProblems = solvedMatch ? parseInt(solvedMatch[1]) : 0;
      const totalProblems = totalMatch ? parseInt(totalMatch[1]) : 0;
      const ranking = rankingMatch ? parseInt(rankingMatch[1]) : 0;
      
      return {
        username,
        solvedProblems,
        totalProblems,
        ranking,
        reputation: 0, // Would need more parsing
        submissions: [] // Would need to scrape submissions page
      };
    } catch (error) {
      console.error('Error scraping LeetCode profile:', error);
      return null;
    }
  }

  static extractProblemNumberFromUrl(url: string): number | null {
    const match = url.match(/problems\/[^\/]+\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  static generateProblemUrl(problemNumber: number): string {
    return `${this.BASE_URL}/problems/${problemNumber}/`;
  }

  private static extractTagsFromContent(content: string): string[] {
    const tags: string[] = [];
    
    // Common LeetCode tags to look for
    const commonTags = [
      'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math',
      'Two Pointers', 'Binary Search', 'Sorting', 'Greedy', 'Tree',
      'Binary Tree', 'Binary Search Tree', 'Breadth-First Search',
      'Depth-First Search', 'Backtracking', 'Sliding Window', 'Graph',
      'Linked List', 'Stack', 'Queue', 'Heap', 'Trie', 'Union Find',
      'Bit Manipulation', 'Recursion', 'Divide and Conquer'
    ];
    
    commonTags.forEach(tag => {
      if (content.toLowerCase().includes(tag.toLowerCase())) {
        tags.push(tag);
      }
    });
    
    return tags;
  }

  private static inferCategoriesFromTags(tags: string[]): string[] {
    const categories: string[] = [];
    
    const categoryMap: Record<string, string[]> = {
      'Data Structures': ['Array', 'String', 'Linked List', 'Stack', 'Queue', 'Tree', 'Graph', 'Hash Table', 'Heap', 'Trie'],
      'Algorithms': ['Sorting', 'Binary Search', 'Two Pointers', 'Sliding Window', 'Greedy', 'Divide and Conquer'],
      'Search & Traversal': ['Breadth-First Search', 'Depth-First Search', 'Backtracking'],
      'Dynamic Programming': ['Dynamic Programming'],
      'Math & Logic': ['Math', 'Bit Manipulation'],
      'Tree Problems': ['Binary Tree', 'Binary Search Tree'],
      'Graph Problems': ['Graph', 'Union Find']
    };
    
    Object.entries(categoryMap).forEach(([category, categoryTags]) => {
      if (categoryTags.some(tag => tags.includes(tag))) {
        categories.push(category);
      }
    });
    
    return categories.length > 0 ? categories : ['General'];
  }

  static getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'Easy': return 'text-success';
      case 'Medium': return 'text-warning';
      case 'Hard': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  }

  static async validateProblemUrl(url: string): Promise<boolean> {
    try {
      const urlPattern = /^https?:\/\/(www\.)?leetcode\.com\/problems\/[^\/]+\/?$/;
      return urlPattern.test(url);
    } catch {
      return false;
    }
  }
}