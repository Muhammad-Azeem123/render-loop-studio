import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { DataIteration, Placeholder } from '@/types/template';
import { Plus, Trash2 } from 'lucide-react';

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
                    <Input
                      value={iteration.values[placeholder.id] || ''}
                      onChange={(e) =>
                        updateIterationValue(iteration.id, placeholder.id, e.target.value)
                      }
                      placeholder={`Enter ${placeholder.type}`}
                    />
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
