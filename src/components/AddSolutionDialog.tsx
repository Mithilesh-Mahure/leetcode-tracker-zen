import { useState } from 'react';
import { ProblemService } from '@/services/problemService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AddSolutionDialogProps {
  children: React.ReactNode;
  problemId: string;
  onSolutionAdded: () => void;
}

const PROGRAMMING_LANGUAGES = [
  'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C', 'C#',
  'Go', 'Rust', 'Ruby', 'Swift', 'Kotlin', 'Scala', 'PHP'
];

const COMPLEXITY_OPTIONS = [
  'O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2^n)', 'O(n!)'
];

export const AddSolutionDialog = ({ children, problemId, onSolutionAdded }: AddSolutionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    language: 'Python',
    code: '',
    runtime: '',
    memory: '',
    beats: '',
    explanation: '',
    approach: '',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    githubUrl: ''
  });
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      language: 'Python',
      code: '',
      runtime: '',
      memory: '',
      beats: '',
      explanation: '',
      approach: '',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      githubUrl: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.approach.trim()) {
      toast({
        title: "Error",
        description: "Please fill in the code and approach",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const solutionData = {
        language: formData.language,
        code: formData.code.trim(),
        runtime: formData.runtime ? parseInt(formData.runtime) : undefined,
        memory: formData.memory ? parseInt(formData.memory) : undefined,
        beats: formData.beats ? parseInt(formData.beats) : undefined,
        explanation: formData.explanation || undefined,
        approach: formData.approach.trim(),
        timeComplexity: formData.timeComplexity,
        spaceComplexity: formData.spaceComplexity,
        githubUrl: formData.githubUrl || undefined
      };

      const result = ProblemService.addSolution(problemId, solutionData);
      
      if (result) {
        onSolutionAdded();
        setOpen(false);
        resetForm();
      } else {
        throw new Error('Failed to add solution');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add solution",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Solution</DialogTitle>
          <DialogDescription>
            Add your solution with detailed analysis
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">Programming Language *</Label>
              <Select value={formData.language} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, language: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMMING_LANGUAGES.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Approach */}
            <div className="space-y-2">
              <Label htmlFor="approach">Approach *</Label>
              <Input
                id="approach"
                placeholder="e.g., Two Pointers, Dynamic Programming"
                value={formData.approach}
                onChange={(e) => setFormData(prev => ({ ...prev, approach: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code">Solution Code *</Label>
            <Textarea
              id="code"
              placeholder="Paste your solution code here..."
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              rows={12}
              className="font-mono text-sm"
              required
            />
          </div>

          {/* Complexity Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeComplexity">Time Complexity</Label>
              <Select value={formData.timeComplexity} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, timeComplexity: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPLEXITY_OPTIONS.map(complexity => (
                    <SelectItem key={complexity} value={complexity}>{complexity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="spaceComplexity">Space Complexity</Label>
              <Select value={formData.spaceComplexity} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, spaceComplexity: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPLEXITY_OPTIONS.map(complexity => (
                    <SelectItem key={complexity} value={complexity}>{complexity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="runtime">Runtime (ms)</Label>
              <Input
                id="runtime"
                type="number"
                placeholder="42"
                value={formData.runtime}
                onChange={(e) => setFormData(prev => ({ ...prev, runtime: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="memory">Memory (MB)</Label>
              <Input
                id="memory"
                type="number"
                placeholder="14.2"
                value={formData.memory}
                onChange={(e) => setFormData(prev => ({ ...prev, memory: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="beats">Beats %</Label>
              <Input
                id="beats"
                type="number"
                placeholder="85"
                min="0"
                max="100"
                value={formData.beats}
                onChange={(e) => setFormData(prev => ({ ...prev, beats: e.target.value }))}
              />
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <Label htmlFor="explanation">Explanation</Label>
            <Textarea
              id="explanation"
              placeholder="Explain your approach and solution logic..."
              value={formData.explanation}
              onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
              rows={4}
            />
          </div>

          {/* GitHub URL */}
          <div className="space-y-2">
            <Label htmlFor="githubUrl">GitHub URL</Label>
            <Input
              id="githubUrl"
              placeholder="https://github.com/username/repo/blob/main/solution.py"
              value={formData.githubUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Add Solution
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};