// nuxt.config.ts -- default configuration f0r framework 


// Copyright (C) 2024 GOSQAS Team
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
// https://nuxt.com/docs/api/configuration/nuxt-config
const globalBaseUrl = 'https://gosqasbe.azurewebsites.net/api';



export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/styles/main.scss'],
  runtimeConfig: {
    // The private keys which are only available server-side
    // Keys within public are also exposed client-side
    public: {
      baseUrl: process.env.BACKEND_URL ? process.env.BACKEND_URL : globalBaseUrl,
      apiBase: '/api',
      frontendUrl: process.env.FRONTEND_URL ? process.env.FRONTEND_URL : 'http://localhost:3000',
    }
  },
  modules: ['@nuxt/test-utils/module', 'nuxt-snackbar'],
  snackbar: {
    bottom: true,
    duration: 5000
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
          // Silence Bootstrap SCSS deprecation warnings until they are fixed
          silenceDeprecations: ['mixed-decls', 'import', 'color-functions', 'global-builtin'],
        },
      }
    }
  },
  compatibilityDate: '2024-11-12'
});