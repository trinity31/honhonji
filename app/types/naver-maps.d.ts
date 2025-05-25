interface NaverMap {
  setCenter: (latlng: naver.maps.LatLng) => void;
  userMarker?: naver.maps.Marker;
}

declare namespace naver {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, mapOptions?: MapOptions);
      setCenter(latlng: LatLng): void;
      userMarker?: Marker;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setPosition(position: LatLng): void;
      getPosition(): LatLng;
      setMap(map: Map | null): void;
      getMap(): Map | null;
    }

    class InfoWindow {
      constructor(options: InfoWindowOptions);
      open(map: Map, marker?: Marker): void;
      close(): void;
      setContent(content: string): void;
    }

    interface MapOptions {
      center?: LatLng;
      zoom?: number;
      minZoom?: number;
      maxZoom?: number;
      zoomControl?: boolean;
      zoomControlOptions?: {
        position?: Position;
      };
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      icon?: {
        content?: string;
        anchor?: Point;
      };
    }

    interface InfoWindowOptions {
      content?: string;
      borderWidth?: number;
      disableAnchor?: boolean;
      backgroundColor?: string;
      pixelOffset?: Point;
    }

    class Point {
      constructor(x: number, y: number);
    }

    enum Position {
      TOP_LEFT,
      TOP_CENTER,
      TOP_RIGHT,
      LEFT_TOP,
      LEFT_CENTER,
      LEFT_BOTTOM,
      RIGHT_TOP,
      RIGHT_CENTER,
      RIGHT_BOTTOM,
      BOTTOM_LEFT,
      BOTTOM_CENTER,
      BOTTOM_RIGHT,
      CENTER
    }

    namespace Event {
      function addListener(target: any, type: string, listener: Function): any;
      function removeListener(listener: any): void;
    }
  }
}

interface Window {
  naver: typeof naver;
}
