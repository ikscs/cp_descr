// src/theme/theme.d.ts

import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    sidebar: {
      background: string;
      text: string;
      items: {
        background: string;
        text: string;
      };
      selected: {
        background: string;
        text: string;
      };
      hover: {
        background: string;
      };
    };
  }

  interface PaletteOptions {
    sidebar?: {
      background?: string;
      text?: string;
      item?: {
        background?: string;
        text?: string;
      };
      selected?: {
        background?: string;
        text?: string;
      };
      hover?: {
        background?: string;
      };
    };
  }
}