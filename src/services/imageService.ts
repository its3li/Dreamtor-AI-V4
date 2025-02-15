import { ImageSettings, ImageResponse } from '../types';

export const modelOptions = [
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Best for general purpose image generation with optimal quality and speed balance',
    promptSuffix: ', masterpiece, best quality, highly detailed, 8k uhd, professional, sharp focus'
  },
  {
    id: 'photorealistic',
    label: 'Photorealistic',
    description: 'Creates highly realistic photographs with exceptional detail and lighting',
    promptSuffix: ', hyperrealistic, photorealistic, octane render, 8k uhd, professional photography, cinematic lighting, dramatic atmosphere, photorealistic details, award-winning photography, masterpiece, sharp focus, high dynamic range shallow-focus, 35mm, photorealistic, Canon EOS 5D Mark IV DSLR, f/5.6 aperture, 1/125 second shutter speed, ISO 100 --ar 2:3 --q 2 --v 4'
  },
  {
    id: 'anime',
    label: 'Anime Style',
    description: 'Generates anime and manga style artwork with vibrant colors and distinct aesthetics',
    promptSuffix: ', anime masterpiece, high quality anime art, Studio Ghibli style, detailed anime illustration, vibrant colors, beautiful anime artwork, professional anime art, manga style, cel shaded, clean lines, anime key visual absurdres like naruto style'
  },
  {
    id: '3d',
    label: '3D Render',
    description: 'Creates detailed 3D rendered scenes with professional quality Like Cartoon',
    promptSuffix: ', professional 3D render, octane render, cinema 4d, unreal engine 5, ray tracing, subsurface scattering, volumetric lighting, high detail textures, 8k textures, physically based rendering 3d closeup Pixar render, unreal engine cinematic smooth, intricate detail, cinematic'
  },
  {
    id: 'logo',
    label: 'Logo Design',
    description: 'Generates professional and modern logo designs with clean aesthetics',
    promptSuffix: ', professional logo design, minimalist, vector art, clean design, corporate branding, scalable, iconic logo, professional graphic design, modern logo, commercial quality abstract logo incorporating clean lines and geometric shapes luxurious, minimalist, etc. '
  }
];

const defaultSettings: ImageSettings = {
  model: 'balanced',
  enhance: true,
  seed: -1,
  nologo: true,
  private: true,
  safe: true,
  imageCount: 2,
  aspectRatio: 'square'
};

const aspectRatioSizes = {
  square: { width: 1024, height: 1024 },
  vertical: { width: 768, height: 1024 },
  horizontal: { width: 1024, height: 768 }
};

export class ImageGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageGenerationError';
  }
}

export async function generateImages(
  prompt: string,
  model: string,
  count: number = 2,
  settings: Partial<ImageSettings> = {}
): Promise<ImageResponse[]> {
  const promises = Array(count).fill(null).map(() => 
    generateImage(prompt, { ...settings, model })
  );
  return Promise.all(promises);
}

export async function generateImage(
  prompt: string,
  settings: Partial<ImageSettings> = {},
  keepSeed: boolean = false
): Promise<ImageResponse> {
  if (!prompt?.trim()) {
    throw new ImageGenerationError('Prompt is required');
  }

  try {
    const finalSettings = {
      ...defaultSettings,
      ...settings,
      seed: keepSeed && settings.seed ? settings.seed : Math.floor(Math.random() * 2147483647)
    };

    // Find the selected style and append its prompt suffix
    const selectedStyle = modelOptions.find(option => option.id === finalSettings.model) || modelOptions[0];
    const enhancedPrompt = prompt.trim() + selectedStyle.promptSuffix;

    // Get dimensions based on aspect ratio
    const dimensions = aspectRatioSizes[finalSettings.aspectRatio || 'square'];

    // Build the URL with parameters
    const params = new URLSearchParams();
    
    if (finalSettings.seed && finalSettings.seed !== -1) {
      params.append('seed', finalSettings.seed.toString());
    }
    params.append('enhance', finalSettings.enhance.toString());
    params.append('nologo', finalSettings.nologo.toString());
    params.append('private', finalSettings.private.toString());
    params.append('safe', finalSettings.safe.toString());
    params.append('width', dimensions.width.toString());
    params.append('height', dimensions.height.toString());
    params.append('guidance', '8');
    params.append('steps', '30');

    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const baseUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
    const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

    // Validate the response
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 500) {
        throw new ImageGenerationError('The image generation service is currently unavailable. Please try again later.');
      }
      throw new ImageGenerationError(`Failed to generate image: ${response.statusText}`);
    }

    // Check if the response is actually an image
    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      throw new ImageGenerationError('Invalid response from the server');
    }

    return {
      url,
      settings: {
        ...finalSettings,
        model: finalSettings.model
      }
    };
  } catch (error) {
    console.error('Error generating image:', error);
    if (error instanceof ImageGenerationError) {
      throw error;
    }
    throw new ImageGenerationError('Failed to generate image. Please try again.');
  }
}

export async function downloadImage(url: string, filename?: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    
    const randomString = Math.random().toString(36).substring(2, 15);
    link.download = filename || `dreamator-${randomString}.png`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Failed to download image:', error);
    throw new Error('Failed to download image. Please try right-clicking and "Save Image As" instead.');
  }
}
