interface GeocodeResponse {
  status: string;
  meta: {
    totalCount: number;
    page: number;
    count: number;
  };
  addresses: Array<{
    roadAddress: string;
    jibunAddress: string;
    englishAddress: string;
    addressElements: any[];
    x: string; // 경도 (longitude)
    y: string; // 위도 (latitude)
    distance: number;
  }>;
  errorMessage?: string;
}

/**
 * Naver Geocoding API를 사용하여 주소로부터 위도와 경도를 가져옵니다.
 * @param address 변환할 주소 문자열
 * @returns {Promise<{ latitude: number; longitude: number } | null>} 위도/경도 객체 또는 실패 시 null
 */
export async function getCoordinatesFromAddress(
  address: string,
): Promise<{ latitude: number; longitude: number } | null> {
  const apiKeyId = process.env.NAVER_API_CLIENT_ID; // 사용자가 .env에 추가했다고 한 이름
  const apiKey = process.env.NAVER_API_CLIENT_SECRET; // 사용자가 .env에 추가했다고 한 이름

  if (!apiKeyId || !apiKey) {
    console.error(
      "Naver Geocoding API credentials (NAVER_API_CLIENT_ID, NAVER_API_CLIENT_SECRET) are not configured in .env",
    );
    return null;
  }

  const apiUrl = `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "X-NCP-APIGW-API-KEY-ID": apiKeyId,
        "X-NCP-APIGW-API-KEY": apiKey,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Naver Geocoding API error: ${response.status} - ${errorText}`,
      );
      return null;
    }

    const data: GeocodeResponse = await response.json();

    if (data.status === "OK" && data.addresses && data.addresses.length > 0) {
      const firstResult = data.addresses[0];
      if (firstResult.x && firstResult.y) {
        return {
          latitude: parseFloat(firstResult.y),
          longitude: parseFloat(firstResult.x),
        };
      }
      console.error("Naver Geocoding API returned address without x, y coordinates", firstResult);
      return null;
    } else {
      console.error(
        "Naver Geocoding API did not return a valid address or status was not OK:",
        data.errorMessage || data.status,
        data
      );
      return null;
    }
  } catch (error) {
    console.error("Error calling Naver Geocoding API:", error);
    return null;
  }
}
