export interface Placeholder {
  id: string;
  name: string;
  type: 'text' | 'price' | 'category' | 'image';
  x: number;
  y: number;
  fontSize: number;
  color: string;
  width?: number;  // For image placeholders
  height?: number; // For image placeholders
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
