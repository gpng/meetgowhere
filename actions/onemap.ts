import axios from 'axios';
import { Postcode, TravelType } from 'models/postcode';
import { to } from 'utils/index';

export const searchPostcode = async (code: string, type: TravelType): Promise<Postcode | null> => {
  const [err, res] = await to(
    axios.get(
      `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${code}&returnGeom=Y&getAddrDetails=N&pageNum=1`,
    ),
  );
  if (err || !res || !res?.data?.['results']?.length) {
    console.error(err);
    return null;
  }
  const data = res.data['results'][0];
  return {
    code,
    lon: parseFloat(data['LONGITUDE']),
    lat: parseFloat(data['LATITUDE']),
    type,
  };
};
