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
} from '@chakra-ui/react';
import Router, { useRouter } from 'next/router';

import About from './About';

import { Postcode } from 'models/postcode';

import { searchPostcode } from 'actions/onemap';

interface Props {
  postcodes: Array<Postcode>;
  setPostcodes: (postcodes: Array<Postcode>) => void;
  calculate: (drivingTime: number, postcodes: Array<Postcode>) => void;
  isCalculating: boolean;
}

const DRIVING_TIMES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

const SearchPanel: FC<Props> = ({ postcodes, setPostcodes, calculate, isCalculating }) => {
  const { isReady, query } = useRouter();

  const [code, setCode] = useState('');
  const [drivingTime, setDrivingTime] = useState(10);
  const [isInvalid, setIsInvalid] = useBoolean();
  const [isLoading, setIsLoading] = useBoolean();

  const inputRef = useRef<HTMLInputElement>(null);
  const initialRef = useRef(false);

  useEffect(() => {
    const checkQueries = async (
      postalCodesQuery?: string,
      drivingTimeQuery?: string,
    ): Promise<void> => {
      const newQuery: Record<string, string | undefined> = {};
      let newDrivingTime: number | null = null;
      const validPostalCodes: Array<Postcode> = [];

      let replaceQuery = false;
      if (drivingTimeQuery) {
        newQuery.drivingTime = drivingTimeQuery;
        try {
          newDrivingTime = parseInt(drivingTimeQuery, 10);
          if (!DRIVING_TIMES.includes(newDrivingTime)) {
            delete newQuery.drivingTime;
            replaceQuery = true;
          } else {
            setDrivingTime(newDrivingTime);
          }
        } catch (e) {
          delete newQuery.drivingTime;
          replaceQuery = true;
        }
      }

      if (postalCodesQuery) {
        let replacePostalCodesQuery = false;
        newQuery.postalCodes = postalCodesQuery;
        const split = postalCodesQuery.split(',');
        for (let i = 0; i < split.length; i += 1) {
          const postalCode = split[i];
          const postalCodeRes = await checkPostcode(postalCode, []);
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
            newQuery.postalCodes = validPostalCodes.map((postcode) => postcode.code).join(',');
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
        calculate(newDrivingTime || 10, validPostalCodes);
      }
    };

    if (!initialRef.current && isReady) {
      initialRef.current = true;

      checkQueries(
        query['postalCodes'] as string | undefined,
        query['drivingTime'] as string | undefined,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, query]);

  const checkPostcode = useCallback(
    async (postalCode: string, currentPostcodes: Array<Postcode>): Promise<Postcode | null> => {
      setIsLoading.on();
      const res = await searchPostcode(postalCode);
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
    <VStack
      pointerEvents="auto"
      maxW="300px"
      bg="white"
      p={2}
      borderRadius={4}
      alignItems="flex-start"
    >
      <About />
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          checkPostcode(code, postcodes);
        }}
      >
        <HStack>
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
          />
          <Button type="submit" disabled={isLoading || !code || code === ''}>
            Add
          </Button>
        </HStack>
      </form>
      <Flex flexWrap="wrap">
        {postcodes.map((postcode, i) => (
          <Tag key={postcode.code} mb={2} mr={2}>
            <TagLabel>{postcode.code}</TagLabel>
            <TagCloseButton onClick={() => onClickPostcode(i)} />
          </Tag>
        ))}
      </Flex>
      <FormControl id="drivingTime">
        <FormLabel>Driving time (minutes)</FormLabel>
        <Select
          onChange={(ev) => setDrivingTime(parseInt(ev.target.value, 10))}
          value={drivingTime}
        >
          {DRIVING_TIMES.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </Select>
      </FormControl>
      <Box>
        <Button
          disabled={isCalculating || postcodes.length < 1}
          onClick={() => calculate(drivingTime, postcodes)}
        >
          Calculate
        </Button>
      </Box>
      <Text fontSize="xs">
        The areas which are accessible from all postal codes in the chosen driving time is
        highlighted in{' '}
        <Text as="span" color="green">
          green
        </Text>
        , if there is no green highlight, then 1 or more postal codes can not meet the others on
        time.
      </Text>
    </VStack>
  );
};

export default React.memo(SearchPanel);
