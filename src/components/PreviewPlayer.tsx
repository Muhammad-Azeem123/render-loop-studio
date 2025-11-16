import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { TemplateCanvas } from './TemplateCanvas';
import { DataIteration, Placeholder } from '@/types/template';
import { Play, Pause, SkipBack, SkipForward, Maximize, Link2, Check } from 'lucide-react';
import { toast } from 'sonner';

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
  const [linkCopied, setLinkCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen().catch(err => {
        toast.error('Failed to enter fullscreen mode');
        console.error(err);
      });
    }
  };

  const handleCopyLink = async () => {
    const templateData = {
      backgroundImage,
      backgroundVideo,
      placeholders,
      iterations,
    };
    
    try {
      const { templatesApi } = await import('@/lib/api/templates');
      
      const data = await templatesApi.createTemplate(templateData);
      
      const shareUrl = `${window.location.origin}/preview?id=${data.id}`;
      
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      toast.success('Preview link copied to clipboard!');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to create share link:', error);
      toast.error('Failed to create share link');
    }
  };

  const currentData = iterations[currentIndex]?.values;

  return (
    <Card className="p-6 space-y-4" ref={containerRef}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Preview</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            disabled={iterations.length === 0 || placeholders.length === 0}
          >
            {linkCopied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4 mr-2" />
                Share Link
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFullscreen}
          >
            <Maximize className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

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
