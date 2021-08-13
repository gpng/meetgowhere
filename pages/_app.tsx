import React, { FC } from 'react';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { NextSeo } from 'next-seo';

import 'mapbox-gl/dist/mapbox-gl.css';

const App: FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <NextSeo
        title="Meet Go Where?"
        description="Can't decide where is most convenient place to meet? Enter your postal codes and find out"
      />
      <ChakraProvider resetCSS>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
};

export default App;
