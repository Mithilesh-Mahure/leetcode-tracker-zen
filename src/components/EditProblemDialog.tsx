import { useState } from 'react';
import { Problem } from '@/types/problem';
import { ProblemService } from '@/services/problemService';
import { ProblemApiService } from '@/services/problemApiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X, Plus } from 'lucide-react';

interface EditProblemDialogProps {
  children: React.ReactNode;
  problem: Problem;
  onUpdated: () => void;
}

const COMMON_CATEGORIES = [
  'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math',
  'Two Pointers', 'Binary Search', 'Sorting', 'Greedy', 'Tree',
  'Binary Tree', 'Binary Search Tree', 'Breadth-First Search',
  'Depth-First Search', 'Backtracking', 'Sliding Window', 'Graph',
  'Linked List', 'Stack', 'Queue', 'Heap', 'Trie', 'Union Find',
  'Bit Manipulation', 'Recursion', 'Divide and Conquer'
];

export const EditProblemDialog = ({ children, problem, onUpdated }: EditProblemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: problem.title,
    difficulty: problem.difficulty,
    category: [...problem.category],
    tags: [...problem.tags],
    url: problem.url || '',
    description: problem.description || '',
    notes: problem.notes || ''
  });
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      title: problem.title,
      difficulty: problem.difficulty,
      category: [...problem.category],
      tags: [...problem.tags],
      url: problem.url || '',
      description: problem.description || '',
      notes: problem.notes || ''
    });
    setNewCategory('');
    setNewTag('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a problem title",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await ProblemApiService.updateProblem(problem.id, {
        title: formData.title.trim(),
        difficulty: formData.difficulty,
        category: formData.category,
        tags: formData.tags,
        url: formData.url || undefined,
        description: formData.description || undefined,
        notes: formData.notes || undefined
      });
      
      onUpdated();
      setOpen(false);
      toast({
        title: "Success",
        description: "Problem updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update problem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = () => {
    if (newCategory.trim() && !formData.category.includes(newCategory.trim())) {
      setFormData(prev => ({
        ...prev,
        category: [...prev.category, newCategory.trim()]
      }));
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.filter(c => c !== category)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addPredefinedCategory = (category: string) => {
    if (!formData.category.includes(category)) {
      setFormData(prev => ({
        ...prev,
        category: [...prev.category, category]
      }));
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Problem</DialogTitle>
          <DialogDescription>
            Update the problem details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url">LeetCode URL</Label>
            <Input
              id="url"
              placeholder="https://leetcode.com/problems/..."
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Problem Title *</Label>
            <Input
              id="title"
              placeholder="Two Sum"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={formData.difficulty} onValueChange={(value: Problem['difficulty']) => 
              setFormData(prev => ({ ...prev, difficulty: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <Label>Categories</Label>
            
            {/* Quick Add Buttons */}
            <div className="flex flex-wrap gap-2">
              {COMMON_CATEGORIES.slice(0, 8).map(category => (
                <Button
                  key={category}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addPredefinedCategory(category)}
                  disabled={formData.category.includes(category)}
                  className="text-xs"
                >
                  {category}
                </Button>
              ))}
            </div>
            
            {/* Custom Category Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom category..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
              />
              <Button type="button" variant="outline" onClick={addCategory}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Selected Categories */}
            {formData.category.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.category.map(category => (
                  <Badge key={category} variant="secondary" className="flex items-center gap-1">
                    {category}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeCategory(category)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add tags..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Problem description..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Personal notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
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
              Update Problem
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};