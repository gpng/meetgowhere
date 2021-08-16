import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  Tag,
  TagCloseButton,
  TagLabel,
  useBoolean,
  VStack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import Router, { useRouter } from 'next/router';

import About from './About';

import { Postcode, TravelType } from 'models/postcode';

import { searchPostcode } from 'actions/onemap';

interface Props {
  postcodes: Array<Postcode>;
  setPostcodes: (postcodes: Array<Postcode>) => void;
  calculate: (travelTime: number, postcodes: Array<Postcode>) => void;
  isCalculating: boolean;
}

const TRAVEL_TIMES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90];
const DEFAULT_TRAVEL_TIME = 30;

const SearchPanel: FC<Props> = ({ postcodes, setPostcodes, calculate, isCalculating }) => {
  const { isReady, query } = useRouter();

  const [code, setCode] = useState('');
  const [travelTime, setTravelTime] = useState(DEFAULT_TRAVEL_TIME);
  const [isInvalid, setIsInvalid] = useBoolean();
  const [isLoading, setIsLoading] = useBoolean();
  const [type, setType] = useState(TravelType.Transit);
  const { isOpen: isHidden, onToggle } = useDisclosure();

  const inputRef = useRef<HTMLInputElement>(null);
  const initialRef = useRef(false);

  useEffect(() => {
    const checkQueries = async (
      postalCodesQuery?: string,
      travelTimeQuery?: string,
    ): Promise<void> => {
      const newQuery: Record<string, string | undefined> = {};
      let newTravelTime: number | null = null;
      const validPostalCodes: Array<Postcode> = [];

      let replaceQuery = false;
      if (travelTimeQuery) {
        newQuery.travelTime = travelTimeQuery;
        try {
          newTravelTime = parseInt(travelTimeQuery, 10);
          if (!TRAVEL_TIMES.includes(newTravelTime)) {
            delete newQuery.travelTime;
            replaceQuery = true;
          } else {
            setTravelTime(newTravelTime);
          }
        } catch (e) {
          delete newQuery.travelTime;
          replaceQuery = true;
        }
      }

      if (postalCodesQuery) {
        let replacePostalCodesQuery = false;
        newQuery.postalCodes = postalCodesQuery;
        const split = postalCodesQuery.split(',');
        for (let i = 0; i < split.length; i += 1) {
          const [postalCode, travelType] = split[i].split(':');
          const postalCodeRes = await checkPostcode(postalCode, [], travelType as TravelType);
          if (postalCodeRes) {
            validPostalCodes.push(postalCodeRes);
          } else {
            replacePostalCodesQuery = true;
          }
        }

        if (replacePostalCodesQuery) {
          replaceQuery = true;
          if (!validPostalCodes.length) {
            delete newQuery.postalCodes;
          } else {
            newQuery.postalCodes = validPostalCodes
              .map((postcode) => `${postcode.code}:${postcode.type}`)
              .join(',');
          }
        }
        setPostcodes(validPostalCodes);
      }

      if (replaceQuery) {
        Router.replace({
          pathname: '/',
          query: newQuery,
        });
      }

      if (validPostalCodes.length >= 1) {
        calculate(newTravelTime || DEFAULT_TRAVEL_TIME, validPostalCodes);
      }
    };

    if (!initialRef.current && isReady) {
      initialRef.current = true;

      checkQueries(
        query['postalCodes'] as string | undefined,
        query['travelTime'] as string | undefined,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, query]);

  const checkPostcode = useCallback(
    async (
      postalCode: string,
      currentPostcodes: Array<Postcode>,
      travelType: TravelType,
    ): Promise<Postcode | null> => {
      if (!Object.values(TravelType).includes(travelType)) {
        return null;
      }

      setIsLoading.on();
      const res = await searchPostcode(postalCode, travelType);
      setIsLoading.off();
      if (!res) {
        setIsInvalid.on();
        return null;
      }
      if (!currentPostcodes.some((postcode) => postcode.code === res.code)) {
        const newPostcodes = [...currentPostcodes];
        newPostcodes.push(res);
        setPostcodes(newPostcodes);
      }
      setCode('');
      inputRef.current?.focus();
      return res;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onClickPostcode = (index: number): void => {
    const newPostcodes = [...postcodes];
    newPostcodes.splice(index, 1);
    setPostcodes(newPostcodes);
  };

  return (
    <Box
      pointerEvents="auto"
      w={isHidden ? 'auto' : '300px'}
      display={isHidden ? 'inline-block' : 'block'}
      maxW="full"
      bg="white"
      p={2}
      borderRadius={4}
    >
      <VStack maxW="full" alignItems="flex-start" display={isHidden ? 'none' : 'flex'}>
        <About />
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            checkPostcode(code, postcodes, type);
          }}
          style={{ width: '100%' }}
        >
          <Input
            value={code}
            onChange={(ev) => {
              setCode(ev.target.value);
              if (isInvalid && ev.target.value !== code) {
                setIsInvalid.off();
              }
            }}
            isInvalid={isInvalid}
            ref={inputRef}
            placeholder="Postal code"
            w="full"
            mb={2}
          />
          <HStack>
            <Select onChange={(ev) => setType(ev.target.value as TravelType)} value={type}>
              <option value={TravelType.Transit}>Public Transport</option>
              <option value={TravelType.Drive}>Car</option>
            </Select>
            <Button type="submit" disabled={isLoading || !code || code === ''}>
              Add
            </Button>
          </HStack>
        </form>
        <Flex flexWrap="wrap">
          {postcodes.map((postcode, i) => (
            <Tag key={postcode.code} mb={2} mr={2}>
              <TagLabel>
                {postcode.code}:{postcode.type}
              </TagLabel>
              <TagCloseButton onClick={() => onClickPostcode(i)} />
            </Tag>
          ))}
        </Flex>
        <FormControl id="travelTime">
          <FormLabel>Travel time (minutes)</FormLabel>
          <Select
            onChange={(ev) => setTravelTime(parseInt(ev.target.value, 10))}
            value={travelTime}
          >
            {TRAVEL_TIMES.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </Select>
        </FormControl>
        <Box>
          <Button
            disabled={isCalculating || postcodes.length < 1}
            onClick={() => calculate(travelTime, postcodes)}
          >
            Calculate
          </Button>
        </Box>
        <Text fontSize="xs">
          The areas which are accessible from all postal codes in the chosen travel time is
          highlighted in{' '}
          <Text as="span" color="green">
            green
          </Text>
          , if there is no green highlight, then 1 or more postal codes can not meet the others on
          time.
        </Text>
      </VStack>
      <Flex justifyContent="flex-end" w={isHidden ? 'auto' : 'full'}>
        <Button size="xs" variant="ghost" textDecor="underline" onClick={onToggle}>
          {isHidden ? 'Expand panel' : 'Hide panel'}
        </Button>
      </Flex>
    </Box>
  );
};

export default React.memo(SearchPanel);
