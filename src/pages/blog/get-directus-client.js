import { createDirectus, rest } from '@directus/sdk';

export const getDirectusClient = () => {
  const client = createDirectus('https://app.empress.eco').with(rest());
  return client;
};
