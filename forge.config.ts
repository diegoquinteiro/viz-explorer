import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
  packagerConfig: {
    icon: './assets/icon',
    osxSign: {},
    osxNotarize: {
      tool: 'notarytool',
      appleApiKey: process.env.APPLE_API_KEY ||  "",
      appleApiKeyId: process.env.APPLE_API_KEY_ID ||  "",
      appleApiIssuer: process.env.APPLE_API_ISSUER ||  "",
    },
    extendInfo: './build-files/Info.plist',
  },
  rebuildConfig: {},
  makers: [{
      name: '@electron-forge/maker-zip',
      config: {},
    },
    {
    name: '@electron-forge/maker-dmg',
    config: {
      background: './assets/dmg-background.png',
      icon: './assets/icon.icns',
      window: {
        size: {
          width: 656,
          height: 491,
        }
      }
    }
  }],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'diegoquinteiro',
          name: 'viz-explorer',
        },
        prerelease: false,
        draft: true,
      },
    },
  ],
  plugins: [
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.ts',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
    }),
  ],
};

export default config;
