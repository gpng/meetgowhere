import React, { FC, useRef, useState } from 'react';
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
} from '@chakra-ui/react';

import { Postcode } from 'models/postcode';

import { searchPostcode } from 'actions/onemap';

interface Props {
  postcodes: Array<Postcode>;
  setPostcodes: (postcodes: Array<Postcode>) => void;
  calculate: (drivingTime: number) => void;
  isCalculating: boolean;
}

const SearchPanel: FC<Props> = ({ postcodes, setPostcodes, calculate, isCalculating }) => {
  const [code, setCode] = useState('');
  const [drivingTime, setDrivingTime] = useState(10);
  const [isInvalid, setIsInvalid] = useBoolean();
  const [isLoading, setIsLoading] = useBoolean();

  const inputRef = useRef<HTMLInputElement>(null);

  const checkPostcode = async (): Promise<void> => {
    setIsLoading.on();
    const res = await searchPostcode(code);
    setIsLoading.off();
    if (!res) {
      setIsInvalid.on();
      return;
    }
    if (!postcodes.some((postcode) => postcode.code === res.code)) {
      const newPostcodes = [...postcodes];
      newPostcodes.push(res);
      setPostcodes(newPostcodes);
    }
    setCode('');
    inputRef.current?.focus();
  };

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
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          checkPostcode();
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
        <Select onChange={(ev) => setDrivingTime(parseInt(ev.target.value, 10))}>
          {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </Select>
      </FormControl>
      <Box>
        <Button
          disabled={isCalculating || postcodes.length < 2}
          onClick={() => calculate(drivingTime)}
        >
          Calculate
        </Button>
      </Box>
    </VStack>
  );
};

export default React.memo(SearchPanel);
