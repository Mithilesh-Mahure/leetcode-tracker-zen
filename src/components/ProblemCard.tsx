import { useState } from 'react';
import { Problem } from '@/types/problem';
import { ProblemService } from '@/services/problemService';
import { LeetCodeService } from '@/services/leetcodeService';
import { ProblemApiService } from '@/services/problemApiService';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AddSolutionDialog } from './AddSolutionDialog';
import { EditProblemDialog } from './EditProblemDialog';
import { 
  Clock, 
  Calendar, 
  Code, 
  ExternalLink, 
  MoreVertical,
  CheckCircle,
  Circle,
  Edit,
  Trash2,
  PlayCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface ProblemCardProps {
  problem: Problem;
  viewMode: 'grid' | 'list';
  onUpdated: () => void;
  onDeleted: () => void;
}

export const ProblemCard = ({ problem, viewMode, onUpdated, onDeleted }: ProblemCardProps) => {
  const [showSolutions, setShowSolutions] = useState(false);
  const { toast } = useToast();

  const handleSolutionAdded = () => {
    onUpdated();
    toast({
      title: "Success",
      description: "Solution added successfully",
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      await ProblemApiService.deleteProblem(problem.id);
      onDeleted();
    }
  };

  const toggleSolved = async () => {
    await ProblemApiService.updateProblem(problem.id, { 
      solved: !problem.solved,
      lastSolvedAt: !problem.solved ? new Date() : problem.lastSolvedAt
    });
    onUpdated();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-success/10 text-success border-success/20';
      case 'Medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'Hard': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSolved}
                className={problem.solved ? 'text-success' : 'text-muted-foreground'}
              >
                {problem.solved ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </Button>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium">{problem.title}</h3>
                  <Badge className={getDifficultyColor(problem.difficulty)}>
                    {problem.difficulty}
                  </Badge>
                  {problem.url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={problem.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{problem.category.join(', ')}</span>
                  <span>•</span>
                  <span>{problem.solutions.length} solution{problem.solutions.length !== 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>{new Date(problem.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <AddSolutionDialog problemId={problem.id} onSolutionAdded={handleSolutionAdded}>
                <Button variant="outline" size="sm">
                  <Code className="w-4 h-4 mr-1" />
                  Add Solution
                </Button>
              </AddSolutionDialog>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <EditProblemDialog problem={problem} onUpdated={onUpdated}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  </EditProblemDialog>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSolved}
              className={problem.solved ? 'text-success' : 'text-muted-foreground'}
            >
              {problem.solved ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
            </Button>
            <Badge className={getDifficultyColor(problem.difficulty)}>
              {problem.difficulty}
            </Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <EditProblemDialog problem={problem} onUpdated={onUpdated}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              </EditProblemDialog>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg leading-tight mb-2">{problem.title}</h3>
          {problem.url && (
            <Button variant="ghost" size="sm" asChild className="h-auto p-0 text-primary">
              <a href={problem.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">View on LeetCode</span>
              </a>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="py-0">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {problem.category.map((cat) => (
              <Badge key={cat} variant="outline" className="text-xs">
                {cat}
              </Badge>
            ))}
          </div>
          
          {problem.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {problem.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Code className="w-3 h-3" />
              <span>{problem.solutions.length} solution{problem.solutions.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <PlayCircle className="w-3 h-3" />
              <span>{problem.attempts} attempt{problem.attempts !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(problem.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <div className="flex gap-2 w-full">
          <AddSolutionDialog problemId={problem.id} onSolutionAdded={handleSolutionAdded}>
            <Button variant="outline" size="sm" className="flex-1">
              <Code className="w-4 h-4 mr-1" />
              Add Solution
            </Button>
          </AddSolutionDialog>
          
          {problem.solutions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSolutions(!showSolutions)}
            >
              View Solutions
            </Button>
          )}
        </div>
      </CardFooter>

      {showSolutions && problem.solutions.length > 0 && (
        <CardContent className="pt-0">
          <Separator className="mb-4" />
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Solutions</h4>
            {problem.solutions.map((solution) => (
              <div key={solution.id} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{solution.language}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(solution.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-4">
                    <span><strong>Time:</strong> {solution.timeComplexity}</span>
                    <span><strong>Space:</strong> {solution.spaceComplexity}</span>
                  </div>
                  {solution.runtime && (
                    <div className="flex items-center gap-4">
                      <span><strong>Runtime:</strong> {solution.runtime}ms</span>
                      {solution.memory && <span><strong>Memory:</strong> {solution.memory}MB</span>}
                    </div>
                  )}
                  {solution.explanation && (
                    <p className="text-muted-foreground mt-2">{solution.explanation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};