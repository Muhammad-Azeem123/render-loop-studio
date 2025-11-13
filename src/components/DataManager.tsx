import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { DataIteration, Placeholder } from '@/types/template';
import { Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface DataManagerProps {
  placeholders: Placeholder[];
  iterations: DataIteration[];
  onIterationsChange: (iterations: DataIteration[]) => void;
}

export const DataManager = ({
  placeholders,
  iterations,
  onIterationsChange,
}: DataManagerProps) => {
  const addIteration = () => {
    const newIteration: DataIteration = {
      id: crypto.randomUUID(),
      values: placeholders.reduce((acc, p) => {
        acc[p.id] = '';
        return acc;
      }, {} as Record<string, string | number>),
      duration: 2000, // default 2 seconds
    };
    onIterationsChange([...iterations, newIteration]);
  };

  const updateIteration = (
    id: string,
    updates: Partial<DataIteration>
  ) => {
    onIterationsChange(
      iterations.map((iter) =>
        iter.id === id ? { ...iter, ...updates } : iter
      )
    );
  };

  const updateIterationValue = (id: string, placeholderId: string, value: string) => {
    onIterationsChange(
      iterations.map((iter) =>
        iter.id === id
          ? { ...iter, values: { ...iter.values, [placeholderId]: value } }
          : iter
      )
    );
  };

  const deleteIteration = (id: string) => {
    onIterationsChange(iterations.filter((iter) => iter.id !== id));
  };

  const handleImageUpload = (iterationId: string, placeholderId: string, file: File) => {
    console.log('Starting image upload...', { iterationId, placeholderId, fileName: file.name });
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      console.log('Image loaded, updating iteration...');
      updateIterationValue(iterationId, placeholderId, result);
      toast.success(`${file.name} uploaded successfully`);
    };
    reader.onerror = () => {
      console.error('Error reading file');
      toast.error('Failed to upload image');
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Data Iterations</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {placeholders.length > 0 
              ? `Fill in data for ${placeholders.length} placeholder${placeholders.length > 1 ? 's' : ''}`
              : 'Add placeholders to the template first'}
          </p>
        </div>
        <Button onClick={addIteration} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Iteration
        </Button>
      </div>

      {placeholders.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Add placeholders to the template first
        </p>
      ) : (
        <div className="space-y-4">
          {iterations.map((iteration, index) => (
            <Card key={iteration.id} className="p-4 space-y-3 bg-muted/50">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Iteration {index + 1}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteIteration(iteration.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Display Duration (seconds)</Label>
                <Input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={iteration.duration / 1000}
                  onChange={(e) =>
                    updateIteration(iteration.id, {
                      duration: parseFloat(e.target.value) * 1000,
                    })
                  }
                  className="w-32"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                {placeholders.map((placeholder) => (
                  <div key={placeholder.id} className="space-y-2">
                    <Label className="text-sm font-medium">{placeholder.name} ({placeholder.type})</Label>
                    {placeholder.type === 'image' ? (
                      <div className="space-y-2">
                        {iteration.values[placeholder.id] && (
                          <div className="relative">
                            <img
                              src={iteration.values[placeholder.id] as string}
                              alt={placeholder.name}
                              className="w-full h-32 object-cover rounded-lg border-2 border-border"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => updateIterationValue(iteration.id, placeholder.id, '')}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                        <Label
                          htmlFor={`img-${iteration.id}-${placeholder.id}`}
                          className="cursor-pointer block"
                        >
                          <div className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input bg-background px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground hover:border-primary transition-colors">
                            <Upload className="h-5 w-5" />
                            {iteration.values[placeholder.id] ? 'Change Image' : 'Upload Image'}
                          </div>
                        </Label>
                        <Input
                          id={`img-${iteration.id}-${placeholder.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('Image file selected:', file.name);
                              handleImageUpload(iteration.id, placeholder.id, file);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <Input
                        value={iteration.values[placeholder.id] || ''}
                        onChange={(e) =>
                          updateIterationValue(iteration.id, placeholder.id, e.target.value)
                        }
                        placeholder={`Enter ${placeholder.type}`}
                        className="h-12"
                      />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}

          {iterations.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-8">
              No iterations yet. Click "Add Iteration" to start.
            </p>
          )}
        </div>
      )}
    </Card>
  );
};
