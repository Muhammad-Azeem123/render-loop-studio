import { useState } from 'react';
import { TemplateCanvas } from '@/components/TemplateCanvas';
import { DataManager } from '@/components/DataManager';
import { PreviewPlayer } from '@/components/PreviewPlayer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Placeholder, DataIteration } from '@/types/template';
import { Upload, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const [iterations, setIterations] = useState<DataIteration[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<string>();
  const [backgroundVideo, setBackgroundVideo] = useState<string>();

  const handlePlaceholderAdd = (placeholder: Omit<Placeholder, 'id'>) => {
    const newPlaceholder: Placeholder = {
      ...placeholder,
      id: crypto.randomUUID(),
      width: placeholder.type === 'image' ? 150 : undefined,
      height: placeholder.type === 'image' ? 150 : undefined,
      objectFit: placeholder.type === 'image' ? 'cover' : undefined,
    };
    setPlaceholders([...placeholders, newPlaceholder]);
    toast.success('Placeholder added');
  };

  const handlePlaceholderUpdate = (id: string, updates: Partial<Placeholder>) => {
    setPlaceholders(
      placeholders.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const handlePlaceholderDelete = (id: string) => {
    setPlaceholders(placeholders.filter((p) => p.id !== id));
    setIterations(
      iterations.map((iter) => {
        const newValues = { ...iter.values };
        delete newValues[id];
        return { ...iter, values: newValues };
      })
    );
    toast.success('Placeholder deleted');
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        
        // Check if it's a video
        if (file.type.startsWith('video/')) {
          setBackgroundVideo(result);
          setBackgroundImage(undefined);
          toast.success('Background video uploaded');
        } else {
          setBackgroundImage(result);
          setBackgroundVideo(undefined);
          toast.success('Background image uploaded');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Template Studio
              </h1>
              <p className="text-sm text-muted-foreground">
                Create dynamic templates with data-driven placeholders
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Template Builder</h2>
                <div className="flex gap-2">
                  <Label htmlFor="bg-upload" className="cursor-pointer">
                    <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Media
                    </div>
                  </Label>
                  <Input
                    id="bg-upload"
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleMediaUpload}
                  />
                </div>
              </div>

              <TemplateCanvas
                backgroundImage={backgroundImage}
                backgroundVideo={backgroundVideo}
                placeholders={placeholders}
                onPlaceholderAdd={handlePlaceholderAdd}
                onPlaceholderUpdate={handlePlaceholderUpdate}
                onPlaceholderDelete={handlePlaceholderDelete}
              />
            </Card>

            <DataManager
              placeholders={placeholders}
              iterations={iterations}
              onIterationsChange={setIterations}
            />
          </div>

          <div className="lg:sticky lg:top-8 h-fit">
            <PreviewPlayer
              backgroundImage={backgroundImage}
              backgroundVideo={backgroundVideo}
              placeholders={placeholders}
              iterations={iterations}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
