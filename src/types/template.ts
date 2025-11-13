export interface Placeholder {
  id: string;
  name: string;
  type: 'text' | 'price' | 'category' | 'image' | 'video';
  x: number;
  y: number;
  fontSize: number;
  color: string;
  width?: number;  // For image/video placeholders
  height?: number; // For image/video placeholders
  objectFit?: 'cover' | 'contain' | 'fill' | 'none'; // For image/video placeholders
}

export interface TemplateData {
  id: string;
  name: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  placeholders: Placeholder[];
}

export interface DataIteration {
  id: string;
  values: Record<string, string | number>;
  duration: number; // in milliseconds
}
