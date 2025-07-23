import { useState } from 'react';
import { Problem } from '@/types/problem';
import { ProblemService } from '@/services/problemService';
import { LeetCodeService } from '@/services/leetcodeService';
import { ProblemApiService } from '@/services/problemApiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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

interface AddProblemDialogProps {
  children: React.ReactNode;
  onProblemAdded: () => void;
}

const COMMON_CATEGORIES = [
  'Array', 'String', 'Hash Table', 'Dynamic Programming', 'Math',
  'Two Pointers', 'Binary Search', 'Sorting', 'Greedy', 'Tree',
  'Binary Tree', 'Binary Search Tree', 'Breadth-First Search',
  'Depth-First Search', 'Backtracking', 'Sliding Window', 'Graph',
  'Linked List', 'Stack', 'Queue', 'Heap', 'Trie', 'Union Find',
  'Bit Manipulation', 'Recursion', 'Divide and Conquer'
];

export const AddProblemDialog = ({ children, onProblemAdded }: AddProblemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Medium' as Problem['difficulty'],
    category: [] as string[],
    tags: [] as string[],
    url: '',
    description: '',
    notes: ''
  });
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      title: '',
      difficulty: 'Medium',
      category: [],
      tags: [],
      url: '',
      description: '',
      notes: ''
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
      await ProblemApiService.addProblem({
        title: formData.title.trim(),
        difficulty: formData.difficulty,
        category: formData.category,
        tags: formData.tags,
        url: formData.url || undefined,
        description: formData.description || undefined,
        notes: formData.notes || undefined,
        // Add required fields with defaults
        attempts: 0,
        solved: false,
        solutions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      onProblemAdded();
      setOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add problem",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScrapeUrl = async () => {
    if (!formData.url) {
      toast({
        title: "Error", 
        description: "Please enter a LeetCode URL first",
        variant: "destructive",
      });
      return;
    }

    const isValidUrl = await LeetCodeService.validateProblemUrl(formData.url);
    if (!isValidUrl) {
      toast({
        title: "Error",
        description: "Please enter a valid LeetCode problem URL",
        variant: "destructive",
      });
      return;
    }

    setIsScrapingUrl(true);
    
    try {
      const scrapedProblem = await LeetCodeService.scrapeProblem(formData.url);
      
      if (scrapedProblem) {
        setFormData(prev => ({
          ...prev,
          title: scrapedProblem.title || prev.title,
          difficulty: scrapedProblem.difficulty || prev.difficulty,
          category: [...new Set([...prev.category, ...scrapedProblem.categories])],
          tags: [...new Set([...prev.tags, ...scrapedProblem.tags])],
          description: scrapedProblem.description || prev.description
        }));
        
        toast({
          title: "Success",
          description: "Problem details scraped successfully",
        });
      } else {
        toast({
          title: "Warning",
          description: "Could not scrape problem details. Please fill manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to scrape problem details",
        variant: "destructive",
      });
    } finally {
      setIsScrapingUrl(false);
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
          <DialogTitle>Add New Problem</DialogTitle>
          <DialogDescription>
            Add a new LeetCode problem to track your progress
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL and Auto-fill */}
          <div className="space-y-2">
            <Label htmlFor="url">LeetCode URL (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                placeholder="https://leetcode.com/problems/..."
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleScrapeUrl}
                disabled={isScrapingUrl || !formData.url}
              >
                {isScrapingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : "Auto-fill"}
              </Button>
            </div>
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
              Add Problem
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};