// utils/normalizeTheme.ts
import { createTheme, Theme } from "@mui/material/styles";

function _normalizeTheme(backendTheme: any) {
  const defaultSidebar = {
    background: "#f5f5f5",
    text: "#000000",
  };

  return createTheme({
    ...backendTheme,
    palette: {
      ...backendTheme?.palette,
      sidebar: {
        ...defaultSidebar,
        ...backendTheme?.palette?.sidebar,
      },
    },
  });
}

export const defaultSidebarPalette = {
    background: '#ffffff', // или любой другой безопасный дефолт
    text: '#000000',
    items: {
        background: 'transparent',
        text: '#000000',
    },
    selected: {
        background: '#e0e0e0',
        text: '#000000',
    },
    hover: {
        background: '#f5f5f5',
    },
};


export function normalizeTheme(rawTheme: any): Theme {
  const baseTheme = createTheme(rawTheme);
  return createTheme(baseTheme, {
    palette: {
      sidebar: {
        ...defaultSidebarPalette,
        ...rawTheme?.palette?.sidebar,
        item: {
          ...defaultSidebarPalette.items,
          ...rawTheme?.palette?.sidebar?.item,
        },
        selected: {
          ...defaultSidebarPalette.selected,
          ...rawTheme?.palette?.sidebar?.selected,
        },
        hover: {
          ...defaultSidebarPalette.hover,
          ...rawTheme?.palette?.sidebar?.hover,
        },
      },
    },
  });
}
