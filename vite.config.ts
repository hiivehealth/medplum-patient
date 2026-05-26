// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const medplumProxy = {
  target: 'https://api.ehr.hiivehealth.net',
  changeOrigin: true,
  secure: true,
  ws: true,
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/.well-known': medplumProxy,
      '/admin': medplumProxy,
      '/auth': medplumProxy,
      '/cds-services': medplumProxy,
      '/email': medplumProxy,
      '/fhir': medplumProxy,
      '/fhircast': medplumProxy,
      '/keyvalue': medplumProxy,
      '/oauth2': medplumProxy,
      '/storage': medplumProxy,
      '/ws': medplumProxy,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test.setup.ts'],
    globals: true,
    testTimeout: 120000,
  },
});
