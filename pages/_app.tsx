import { ChakraProvider } from '@chakra-ui/react';
import { NextSeo } from 'next-seo';
import type { AppProps } from 'next/app';
import { FC } from 'react';

import 'mapbox-gl/dist/mapbox-gl.css';

const App: FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <NextSeo
        title="Meet Go Where?"
        description="Can't decide where is most convenient place to meet? Enter your postal codes and find out"
        additionalLinkTags={[
          {
            rel: 'icon',
            type: 'image/png',
            sizes: '32x32',
            href: '/favicon-32x32.png',
          },
          {
            rel: 'icon',
            type: 'image/png',
            sizes: '16x16',
            href: '/favicon-16x16.png',
          },
          {
            rel: 'apple-touch-icon',
            sizes: '180x180',
            href: '/apple-touch-icon.png',
          },
          {
            rel: 'manifest',
            href: '/site.webmanifest',
          },
        ]}
      />
      <ChakraProvider resetCSS>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
};

export default App;
