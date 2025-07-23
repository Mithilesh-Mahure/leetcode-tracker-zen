import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ImportLeetCodeDialogProps {
  children: React.ReactNode;
  onProblemsImported: () => void;
}

export const ImportLeetCodeDialog = ({ children, onProblemsImported }: ImportLeetCodeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [leetcodeUrl, setLeetcodeUrl] = useState('');
  const { toast } = useToast();

  const handleImport = async () => {
    setIsLoading(true);
    // Simulate import process
    setTimeout(() => {
      setIsLoading(false);
      setOpen(false);
      toast({ title: "Success", description: "Problems imported successfully" });
      onProblemsImported();
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import from LeetCode</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="url">LeetCode Problem URL</Label>
            <Input
              id="url"
              placeholder="https://leetcode.com/problems/..."
              value={leetcodeUrl}
              onChange={(e) => setLeetcodeUrl(e.target.value)}
            />
          </div>
          <Button onClick={handleImport} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Import Problem
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};