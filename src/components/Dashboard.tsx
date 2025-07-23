import { useState, useEffect } from 'react';
import { ProblemService } from '@/services/problemService';
import { ProblemApiService } from '@/services/problemApiService';
import { Problem, ProgressStats } from '@/types/problem';
import { ProblemList } from './ProblemList';
import { ProgressDashboard } from './ProgressDashboard';
import { AddProblemDialog } from './AddProblemDialog';
import { ImportLeetCodeDialog } from './ImportLeetCodeDialog';
import { ExportImportDialog } from './ExportImportDialog';
import { ApiKeyDialog } from './ApiKeyDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Download, 
  Upload, 
  Github, 
  Search, 
  Filter,
  TrendingUp,
  Code,
  Settings
} from 'lucide-react';

export const Dashboard = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showSolvedOnly, setShowSolvedOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('problems');
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProblems();
  }, [problems, searchQuery, selectedDifficulties, selectedCategories, showSolvedOnly]);

  const loadData = async () => {
    setLoading(true);
    try {
      const loadedProblems = await ProblemApiService.getProblems();
      setProblems(loadedProblems);
      // setProgressStats(ProblemService.getProgressStats()); // Optionally update this if you move stats to backend
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load problems', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filterProblems = () => {
    // Simple filtering, you can expand as needed
    let filtered = problems;
    if (searchQuery) {
      filtered = filtered.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedDifficulties.length > 0) {
      filtered = filtered.filter(p => selectedDifficulties.includes(p.difficulty));
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => p.category.some(cat => selectedCategories.includes(cat)));
    }
    if (showSolvedOnly) {
      filtered = filtered.filter(p => p.solved);
    }
    setFilteredProblems(filtered);
  };

  const handleProblemAdded = () => {
    loadData();
    toast({
      title: 'Success',
      description: 'Problem added successfully',
    });
  };

  const handleProblemUpdated = () => {
    loadData();
    toast({
      title: 'Success',
      description: 'Problem updated successfully',
    });
  };

  const handleProblemDeleted = () => {
    loadData();
    toast({
      title: 'Success',
      description: 'Problem deleted successfully',
    });
  };

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulties(prev => 
      prev.includes(difficulty) 
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const allCategories = [...new Set(problems.flatMap(p => p.category))];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-background border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LeetCode Zen Master
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Track your coding journey, analyze progress, and master data structures & algorithms
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <AddProblemDialog onProblemAdded={handleProblemAdded}>
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Problem
                </Button>
              </AddProblemDialog>
              <ImportLeetCodeDialog onProblemsImported={handleProblemAdded}>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Import from LeetCode
                </Button>
              </ImportLeetCodeDialog>
              <ApiKeyDialog>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  API Settings
                </Button>
              </ApiKeyDialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        {progressStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Solved</p>
                  <p className="text-2xl font-bold text-success">
                    {progressStats.solvedProblems}/{progressStats.totalProblems}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold text-warning">{progressStats.currentStreak}</p>
                </div>
                <Code className="w-8 h-8 text-warning" />
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-info/10 to-info/5 border-info/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Longest Streak</p>
                  <p className="text-2xl font-bold text-info">{progressStats.longestStreak}</p>
                </div>
                <Github className="w-8 h-8 text-info" />
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Time</p>
                  <p className="text-2xl font-bold text-accent">{Math.round(progressStats.averageTime)}m</p>
                </div>
                <Filter className="w-8 h-8 text-accent" />
              </div>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-400">
            <TabsTrigger value="problems">Problems</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="problems" className="space-y-6">
            {/* Filters */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search problems..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <ExportImportDialog 
                      onImported={handleProblemAdded}
                      problems={problems}
                    >
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Export/Import
                      </Button>
                    </ExportImportDialog>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Difficulty:</span>
                  {['Easy', 'Medium', 'Hard'].map(difficulty => (
                    <Badge
                      key={difficulty}
                      variant={selectedDifficulties.includes(difficulty) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => toggleDifficulty(difficulty)}
                    >
                      {difficulty}
                    </Badge>
                  ))}
                </div>

                {allCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Categories:</span>
                    {allCategories.slice(0, 8).map(category => (
                      <Badge
                        key={category}
                        variant={selectedCategories.includes(category) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/20"
                        onClick={() => toggleCategory(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Badge
                    variant={showSolvedOnly ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20"
                    onClick={() => setShowSolvedOnly(!showSolvedOnly)}
                  >
                    Solved Only
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Showing {filteredProblems.length} of {problems.length} problems
                  </span>
                </div>
              </div>
            </Card>

            {/* Problems List */}
            <ProblemList
              problems={filteredProblems}
              onProblemUpdated={handleProblemUpdated}
              onProblemDeleted={handleProblemDeleted}
            />
          </TabsContent>

          <TabsContent value="analytics">
            {progressStats && (
              <ProgressDashboard stats={progressStats} problems={problems} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};