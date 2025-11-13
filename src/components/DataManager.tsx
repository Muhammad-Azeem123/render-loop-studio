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
    const reader = new FileReader();
    reader.onload = (event) => {
      updateIterationValue(iterationId, placeholderId, event.target?.result as string);
      toast.success('Image uploaded');
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Data Iterations</h2>
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

              <div className="grid grid-cols-2 gap-3">
                {placeholders.map((placeholder) => (
                  <div key={placeholder.id} className="space-y-1">
                    <Label className="text-xs">{placeholder.name}</Label>
                    {placeholder.type === 'image' ? (
                      <div className="space-y-2">
                        {iteration.values[placeholder.id] && (
                          <img
                            src={iteration.values[placeholder.id] as string}
                            alt={placeholder.name}
                            className="w-full h-24 object-cover rounded border"
                          />
                        )}
                        <Label
                          htmlFor={`img-${iteration.id}-${placeholder.id}`}
                          className="cursor-pointer"
                        >
                          <div className="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Image
                          </div>
                        </Label>
                        <Input
                          id={`img-${iteration.id}-${placeholder.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(iteration.id, placeholder.id, file);
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
