import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { TemplateCanvas } from './TemplateCanvas';
import { DataIteration, Placeholder } from '@/types/template';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface PreviewPlayerProps {
  backgroundImage?: string;
  backgroundVideo?: string;
  placeholders: Placeholder[];
  iterations: DataIteration[];
}

export const PreviewPlayer = ({
  backgroundImage,
  backgroundVideo,
  placeholders,
  iterations,
}: PreviewPlayerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying || iterations.length === 0) return;

    const currentIteration = iterations[currentIndex];
    const duration = currentIteration?.duration || 2000;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % iterations.length);
    }, duration);

    return () => clearInterval(interval);
  }, [isPlaying, iterations, currentIndex]);

  const handlePlay = () => {
    if (iterations.length === 0) return;
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (iterations.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % iterations.length);
  };

  const handlePrevious = () => {
    if (iterations.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + iterations.length) % iterations.length);
  };

  const currentData = iterations[currentIndex]?.values;

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Preview</h2>

      <TemplateCanvas
        backgroundImage={backgroundImage}
        backgroundVideo={backgroundVideo}
        placeholders={placeholders}
        onPlaceholderAdd={() => {}}
        onPlaceholderUpdate={() => {}}
        onPlaceholderDelete={() => {}}
        currentData={currentData}
        isPreview
      />

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {iterations.length > 0
            ? `Iteration ${currentIndex + 1} of ${iterations.length}`
            : 'No iterations to preview'}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={iterations.length === 0}
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          {isPlaying ? (
            <Button variant="default" size="icon" onClick={handlePause}>
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="default"
              size="icon"
              onClick={handlePlay}
              disabled={iterations.length === 0}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={iterations.length === 0}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
