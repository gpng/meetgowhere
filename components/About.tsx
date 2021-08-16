import React, { FC } from 'react';
import Image from 'next/image';
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
  Flex,
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
          <ModalBody pb={8}>
            <Text>
              Add multiple postal codes and select a transport mode for each one, select the max
              travel time, and it will show you which is the best area to meet up.
            </Text>
            <Heading size="sm" mt={4} mb={4} fontWeight="semibold">
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
            <Heading size="sm" mt={4} mb={4} fontWeight="semibold">
              Why?
            </Heading>
            <Text>
              Colleagues were deciding where to organize a team lunch and someone suggested that it
              could be a webapp idea, so I thought it was interesting and fun to do and took out a
              few hours to make it.
            </Text>
            <Heading size="sm" mt={4} mb={4} fontWeight="semibold">
              Is it accurate?
            </Heading>
            <Text>
              Probably not. Public transport data is 2~3 years old. Driving time also seems to be
              quite optimistic
            </Text>
            <Heading size="sm" mt={4} mb={4} fontWeight="semibold">
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
              to verify the postal codes.
              <br />
              <br />
              <Link
                href="https://docs.mapbox.com/api/navigation/isochrone/"
                isExternal
                textDecor="underline"
              >
                Mapbox Isochrone API
              </Link>{' '}
              to generate the travel area for driving.
              <br />
              <br />
              <Link href="https://www.opentripplanner.org/" isExternal textDecor="underline">
                OpenTripPlanner
              </Link>{' '}
              to generate the travel area for public transport.
              <br />
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
            <Heading size="sm" mt={4} mb={4} fontWeight="semibold">
              Credits
            </Heading>
            <Text>
              <Link href="https://github.com/yinshanyang" isExternal textDecor="underline">
                yinshanyang
              </Link>{' '}
              for his prior work with isochrone Singapore, OpenTripPlanner setup and SG GTFS data.
              <br />
              <br />
              <Link
                href="https://github.com/cheeaun/railrouter-sg"
                isExternal
                textDecor="underline"
              >
                cheeaun RailRouter SG
              </Link>{' '}
              where the MRT station data and sprites are from.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Flex justifyContent="space-between" w="full">
              <Link href="https://www.buymeacoffee.com/gpng" isExternal>
                <Image src="/coffee.png" alt="Buy Me A Coffee" width={145} height={40} />
              </Link>
              <Button onClick={onClose}>Close</Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default About;
