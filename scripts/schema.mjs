import { z } from 'zod';

export const ConfigSchema = z.object({
  video: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    fps: z.number().optional(),
  }).passthrough().optional(),
  audio: z.object({}).passthrough().optional(),
  branding: z.object({}).passthrough().optional(),
  titlePage: z.object({}).passthrough().optional(),
  slides: z.array(z.object({
    heading: z.string().optional(),
    content: z.string().optional(),
    durationInSeconds: z.number().optional(),
  }).passthrough()).optional(),
  endPage: z.object({}).passthrough().optional()
}).passthrough();

export function validateConfig(config) {
  return ConfigSchema.parse(config);
}
