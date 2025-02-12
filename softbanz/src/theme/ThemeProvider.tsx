import React, { useState } from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material';
import { themeCreator } from './base';
import { StylesProvider } from '@mui/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import stylisRTLPlugin from 'stylis-plugin-rtl';

// Create Emotion cache for RTL support
const cacheRtl = createCache({
  key: 'bloom-ui',
  prepend: true,
  // @ts-ignore
  stylisPlugins: [stylisRTLPlugin],
});

// Provide a default function for ThemeContext
export const ThemeContext = React.createContext<(themeName: string) => void>(
  () => {
    throw new Error('setThemeName function must be used within a ThemeProvider');
  }
);

// ThemeProviderWrapper Component
const ThemeProviderWrapper: React.FC<React.PropsWithChildren<{}>> = (props) => {
  const curThemeName =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('appTheme') || 'PureLightTheme'
      : 'PureLightTheme';

  const [themeName, _setThemeName] = useState(curThemeName);
  const theme = themeCreator(themeName);

  const setThemeName = (themeName: string): void => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('appTheme', themeName);
    }
    _setThemeName(themeName);
  };

  return (
    <StylesProvider injectFirst>
      <CacheProvider value={cacheRtl}>
        <StyledEngineProvider injectFirst>
          {/* Ensure ThemeContext.Provider is wrapping the children */}
          <ThemeContext.Provider value={setThemeName}>
            <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
          </ThemeContext.Provider>
        </StyledEngineProvider>
      </CacheProvider>
    </StylesProvider>
  );
};

export default ThemeProviderWrapper;