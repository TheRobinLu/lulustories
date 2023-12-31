import { ClientConfig, createClient } from 'next-sanity';
import createImageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

export const config: ClientConfig = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2021-03-25',
  useCdn: process.env.USE_CDN == '1',
};

export const sanityClient = createClient(config);

export const urlFor = (source: SanityImageSource) => createImageUrlBuilder(sanityClient).image(source);
