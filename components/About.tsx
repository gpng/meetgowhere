import React, { FC } from 'react';
import {
  Box,
  Button,
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Heading,
  Link,
} from '@chakra-ui/react';

const About: FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box>
      <Button variant="link" textDecor="underline" fontSize="sm" onClick={onOpen}>
        What does this site do?
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>What does this site do?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Add multiple postal codes, select the max driving time, and it will show you which is
              the best area to meet up.
            </Text>
            <Heading size="sm" mt={4} mb={2} fontWeight="semibold">
              A bit more details?
            </Heading>
            <Text>
              For each postal code you enter, an area will be highlighted which shows where you can
              reach in the driving time you have selected. You can click the purple bubble
              representing each postal code to highlight the specific area
              <br />
              <br />
              The overlapping area will be highlighted in{' '}
              <Text as="span" color="green">
                green
              </Text>{' '}
              and represents the area where every postal code can all meet each other within the
              driving time specified.
            </Text>
            <Heading size="sm" mt={4} mb={2} fontWeight="semibold">
              Why?
            </Heading>
            <Text>
              Colleagues were deciding where to organize a team lunch and someone suggested that it
              could be a webapp idea, so I thought it was interesting and fun to do and took out a
              few hours to make it.
            </Text>
            <Heading size="sm" mt={4} mb={2} fontWeight="semibold">
              Is it accurate?
            </Heading>
            <Text>Probably not.</Text>
            <Heading size="sm" mt={4} mb={2} fontWeight="semibold">
              How?
            </Heading>
            <Text>
              <Link
                href="https://www.onemap.gov.sg/docs/#onemap-rest-apis"
                isExternal
                textDecor="underline"
              >
                OneMap Search API
              </Link>{' '}
              is used to verify the postal codes.
              <br />
              <Link
                href="https://docs.mapbox.com/api/navigation/isochrone/"
                isExternal
                textDecor="underline"
              >
                Mapbox Isochrone API
              </Link>{' '}
              is used to generate the polygons for each postal code, and the intersection of each
              isochrone polygon is calculated to generate the overlapping polygon.
              <br />
              <br />
              The site itself is written in Typescript React and{' '}
              <Link href="https://nextjs.org/" isExternal textDecor="underline">
                Next.js
              </Link>
              , and hosted by{' '}
              <Link href="https://vercel.com/" isExternal textDecor="underline">
                Vercel
              </Link>
              .
              <br />
              <br />
              Source code is on{' '}
              <Link href="https://github.com/gpng/meetgowhere" isExternal textDecor="underline">
                GitHub
              </Link>
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default About;
