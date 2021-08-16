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
              Add multiple postal codes and select a transport mode for each one, select the max
              travel time, and it will show you which is the best area to meet up.
            </Text>
            <Heading size="sm" mt={4} mb={2} fontWeight="semibold">
              A bit more details?
            </Heading>
            <Text>
              For each postal code and transport mode you enter, an area will be highlighted which
              shows where you can reach in the travel time you have selected. You can click the
              purple bubble representing each postal code to highlight the specific area
              <br />
              <br />
              The overlapping area will be highlighted in{' '}
              <Text as="span" color="green">
                green
              </Text>{' '}
              and represents the area where every postal code can all meet each other within the
              travel time specified.
              <br />
              <br />
              If there is no{' '}
              <Text as="span" color="green">
                green
              </Text>{' '}
              highlight, then at least 1 postal code can not meet the others in the time specified.
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
            <Text>
              Probably not. Public transport data is 2~3 years old. Driving time also seems to be
              very optimistic
            </Text>
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
              is used to generate the travel area for driving.
              <br />
              <Link href="https://www.opentripplanner.org/" isExternal textDecor="underline">
                OpenTripPlanner
              </Link>{' '}
              is used to generate the travel area for public transport.
              <br />
              The intersection of each isochrone polygon is calculated to generate the overlapping
              polygon.
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
            </Text>{' '}
            <Heading size="sm" mt={4} mb={2} fontWeight="semibold">
              Credits
            </Heading>
            <Text>
              <Link href="https://github.com/yinshanyang" isExternal textDecor="underline">
                yinshanyang
              </Link>{' '}
              for his prior work with isochrone Singapore, OpenTripPlanner setup and SG GTFS data
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
