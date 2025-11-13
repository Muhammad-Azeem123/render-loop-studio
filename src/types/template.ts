export interface Placeholder {
  id: string;
  name: string;
  type: 'text' | 'price' | 'category';
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export interface TemplateData {
  id: string;
  name: string;
  backgroundImage?: string;
  placeholders: Placeholder[];
}

export interface DataIteration {
  id: string;
  values: Record<string, string | number>;
}
