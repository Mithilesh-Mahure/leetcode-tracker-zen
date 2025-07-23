import { useState } from 'react';
import { Problem } from '@/types/problem';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload } from 'lucide-react';

interface ExportImportDialogProps {
  children: React.ReactNode;
  problems: Problem[];
  onImported: () => void;
}

export const ExportImportDialog = ({ children, problems, onImported }: ExportImportDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleExport = () => {
    const data = ProblemService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leetcode-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Success", description: "Data exported successfully" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export/Import Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button onClick={handleExport} className="w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All Data
          </Button>
          <Button className="w-full" variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};