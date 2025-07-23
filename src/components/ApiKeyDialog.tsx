import { useState } from 'react';
import { FirecrawlService } from '@/services/firecrawlService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyDialogProps {
  children: React.ReactNode;
}

export const ApiKeyDialog = ({ children }: ApiKeyDialogProps) => {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState(FirecrawlService.getApiKey() || '');
  const { toast } = useToast();

  const handleSave = () => {
    if (apiKey.trim()) {
      FirecrawlService.saveApiKey(apiKey.trim());
      toast({ title: "Success", description: "API key saved successfully" });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="apiKey">Firecrawl API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="fc-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            Save API Key
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};