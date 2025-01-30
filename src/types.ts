export interface ImageSettings {
  model?: string;
  seed?: number;
  enhance?: boolean;
  nologo?: boolean;
  private?: boolean;
  safe?: boolean;
  imageCount?: number;
  aspectRatio?: 'square' | 'vertical' | 'horizontal';
}

export interface ImageData {
  url: string;
  prompt: string;
  editPrompt?: string;
  isEditing: boolean;
  isLoading: boolean;
  settings: {
    seed: number;
    model: string;
  }
}

export interface ImageResponse {
  url: string;
  settings: ImageSettings;
}