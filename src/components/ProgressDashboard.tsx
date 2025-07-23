import { ProgressStats, Problem } from '@/types/problem';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Target, Clock } from 'lucide-react';

interface ProgressDashboardProps {
  stats: ProgressStats;
  problems: Problem[];
}

export const ProgressDashboard = ({ stats, problems }: ProgressDashboardProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Progress</p>
              <p className="text-2xl font-bold">{Math.round((stats.solvedProblems / stats.totalProblems) * 100)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Easy Problems</p>
              <p className="text-2xl font-bold text-success">{stats.easyProblems}</p>
            </div>
            <Target className="w-8 h-8 text-success" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Medium Problems</p>
              <p className="text-2xl font-bold text-warning">{stats.mediumProblems}</p>
            </div>
            <Target className="w-8 h-8 text-warning" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Hard Problems</p>
              <p className="text-2xl font-bold text-destructive">{stats.hardProblems}</p>
            </div>
            <Target className="w-8 h-8 text-destructive" />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(stats.categoryProgress).map(([category, count]) => (
              <div key={category} className="text-center p-4 border rounded-lg">
                <h3 className="font-medium">{category}</h3>
                <p className="text-2xl font-bold text-primary">{count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};