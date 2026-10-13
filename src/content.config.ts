import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    code: z.string(), // short CLI-style id, e.g. "saas"
    summary: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

const process = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/process' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    command: z.string(), // shown as `$ larp <command>`
    summary: z.string(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    category: z.enum(['saas', 'tool', 'service', 'device', 'maker', 'consulting']),
    status: z.enum(['coming-soon', 'in-progress', 'shipped']).default('coming-soon'),
    summary: z.string(),
    href: z.url().optional(),
    draft: z.boolean().default(false),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
  schema: z.object({
    question: z.string(),
    order: z.number(),
  }),
});

export const collections = { services, process, projects, faq };
