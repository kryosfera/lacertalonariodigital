import { useState } from 'react';
import { X, Plus, Video } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface VideoUrlsFieldProps {
  videoUrls: string[];
  onChange: (urls: string[]) => void;
}

function extractVimeoUrl(input: string): string {
  // If it's an iframe, extract the src
  const iframeMatch = input.match(/src=["']([^"']+)["']/);
  if (iframeMatch) return iframeMatch[1];
  // Otherwise return trimmed input
  return input.trim();
}

export function VideoUrlsField({ videoUrls, onChange }: VideoUrlsFieldProps) {
  const [newUrl, setNewUrl] = useState('');

  const handleAdd = () => {
    const url = extractVimeoUrl(newUrl);
    if (!url) return;
    if (videoUrls.includes(url)) {
      setNewUrl('');
      return;
    }
    onChange([...videoUrls, url]);
    setNewUrl('');
  };

  const handleRemove = (index: number) => {
    onChange(videoUrls.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5">
        <Video className="h-4 w-4" />
        Vídeos
      </Label>

      {videoUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {videoUrls.map((url, index) => (
            <Badge key={index} variant="secondary" className="gap-1 max-w-full">
              <span className="truncate text-xs max-w-[250px]">{url}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="URL de Vimeo o pegar iframe..."
          className="flex-1"
        />
        <Button type="button" size="icon" variant="outline" onClick={handleAdd} disabled={!newUrl.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
