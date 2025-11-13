import { useRef, useState } from 'react';
import { Placeholder } from '@/types/template';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Trash2, Edit2 } from 'lucide-react';

interface TemplateCanvasProps {
  backgroundImage?: string;
  placeholders: Placeholder[];
  onPlaceholderAdd: (placeholder: Omit<Placeholder, 'id'>) => void;
  onPlaceholderUpdate: (id: string, updates: Partial<Placeholder>) => void;
  onPlaceholderDelete: (id: string) => void;
  currentData?: Record<string, string | number>;
  isPreview?: boolean;
}

export const TemplateCanvas = ({
  backgroundImage,
  placeholders,
  onPlaceholderAdd,
  onPlaceholderUpdate,
  onPlaceholderDelete,
  currentData,
  isPreview = false,
}: TemplateCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPreview) return;
    
    // Allow clicking anywhere in the canvas, but not on placeholders
    const isPlaceholder = (e.target as HTMLElement).hasAttribute('data-placeholder');
    if (isPlaceholder) return;

    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onPlaceholderAdd({
      name: `Placeholder ${placeholders.length + 1}`,
      type: 'text',
      x,
      y,
      fontSize: 24,
      color: '#000000',
    });
  };

  const handlePlaceholderDrag = (id: string, e: React.MouseEvent) => {
    if (isPreview) return;
    e.preventDefault();
    setIsDragging(true);
    setSelectedId(id);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const y = ((moveEvent.clientY - rect.top) / rect.height) * 100;

      onPlaceholderUpdate(id, {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="space-y-4">
      <Card
        ref={canvasRef}
        className="relative w-full aspect-video bg-muted overflow-hidden cursor-crosshair"
        onClick={handleCanvasClick}
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {placeholders.map((placeholder) => (
          <div
            key={placeholder.id}
            data-placeholder="true"
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded ${
              !isPreview ? 'cursor-move hover:ring-2 hover:ring-primary' : ''
            } ${selectedId === placeholder.id && !isDragging ? 'ring-2 ring-primary' : ''}`}
            style={{
              left: `${placeholder.x}%`,
              top: `${placeholder.y}%`,
              fontSize: `${placeholder.fontSize}px`,
              color: placeholder.color,
              fontWeight: 600,
            }}
            onMouseDown={(e) => handlePlaceholderDrag(placeholder.id, e)}
            onClick={(e) => {
              if (!isPreview) {
                e.stopPropagation();
                setSelectedId(placeholder.id);
              }
            }}
          >
            {currentData && currentData[placeholder.id] !== undefined
              ? String(currentData[placeholder.id])
              : placeholder.name}
          </div>
        ))}
        {!isPreview && placeholders.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            Click anywhere to add a placeholder
          </div>
        )}
      </Card>

      {!isPreview && selectedId && (
        <PlaceholderEditor
          placeholder={placeholders.find((p) => p.id === selectedId)!}
          onUpdate={(updates) => onPlaceholderUpdate(selectedId, updates)}
          onDelete={() => {
            onPlaceholderDelete(selectedId);
            setSelectedId(null);
          }}
        />
      )}
    </div>
  );
};

interface PlaceholderEditorProps {
  placeholder: Placeholder;
  onUpdate: (updates: Partial<Placeholder>) => void;
  onDelete: () => void;
}

const PlaceholderEditor = ({ placeholder, onUpdate, onDelete }: PlaceholderEditorProps) => {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Edit Placeholder</h3>
        <Button variant="destructive" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={placeholder.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={placeholder.type}
            onChange={(e) => onUpdate({ type: e.target.value as Placeholder['type'] })}
          >
            <option value="text">Text</option>
            <option value="price">Price</option>
            <option value="category">Category</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fontSize">Font Size</Label>
          <Input
            id="fontSize"
            type="number"
            value={placeholder.fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            type="color"
            value={placeholder.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
          />
        </div>
      </div>
    </Card>
  );
};
