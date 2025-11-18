import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PreviewPlayer } from '@/components/PreviewPlayer';
import { DataIteration, Placeholder } from '@/types/template';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { templatesApi } from '@/lib/api/templates';

const Preview = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [templateData, setTemplateData] = useState<{
    backgroundImage?: string;
    backgroundVideo?: string;
    placeholders: Placeholder[];
    iterations: DataIteration[];
  } | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      const id = searchParams.get('id');
      if (!id) {
        toast.error('No template ID found');
        return;
      }

      try {
        const data = await templatesApi.getTemplate(id);

        if (data?.template_data) {
          setTemplateData(data.template_data as any);
        }
      } catch (error) {
        console.error('Failed to load template:', error);
        toast.error('Failed to load preview');
      }
    };

    fetchTemplate();
  }, [searchParams]);

  if (!templateData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Preview...</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Editor
          </Button>
        </div>
      </div>
    );
  }

  const copyJsonToClipboard = async () => {
    try {
      const jsonData = {
        template_data: templateData
      };
      await navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
      toast.success('Template JSON copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy JSON');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Editor
          </Button>
          <Button variant="outline" onClick={copyJsonToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copy JSON
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <PreviewPlayer
          backgroundImage={templateData.backgroundImage}
          backgroundVideo={templateData.backgroundVideo}
          placeholders={templateData.placeholders}
          iterations={templateData.iterations}
        />
      </main>
    </div>
  );
};

export default Preview;
