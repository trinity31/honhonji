/**
 * 지도에 표시할 커스텀 오버레이를 생성하는 함수
 *
 * @param marker - 카카오맵 마커 객체
 * @param restaurant - 식당 정보 객체 (name, description 필드 필요)
 * @returns 생성된 nameWindow와 descWindow 객체
 */
export function createCustomOverlays(
  marker: any,
  restaurant: { id: number; name: string; description: string | null },
) {
  const nameWindow = new window.kakao.maps.CustomOverlay({
    position: marker.getPosition(),
    content: `<div style='
                    padding: 8px 12px;
                    background: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                    font-size: 14px;
                    font-weight: 500;
                    line-height: 1.4;
                    white-space: nowrap;
                    text-align: center;
                    color: #333;
                    display: flex;
                    align-items: center;
                  '>
                    <b>${restaurant.name}</b>
                  </div>`,
    yAnchor: 2.1,
    zIndex: 1,
  });

  const descWindowContent = `
    <div style='
      padding: 16px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.12);
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      min-width: 200px;
    '>
      <div style='
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
        color: #222;
      '>${restaurant.name}</div>
      <div style='
        font-size: 14px;
        color: #555;
        white-space: normal;
        word-break: break-word;
        margin-bottom: 12px;
      '>${restaurant.description || "설명이 없습니다."}</div>
      <div>
        <button class="overlay-details-button" style='
          display: block;
          width: 100%;
          padding: 8px 12px;
          background-color: #fb923c;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          text-align: center;
          font-weight: 500;
          font-size: 13px;
          border: none;
          cursor: pointer;
          margin-bottom: 8px;
        '>
          자세히 보기
        </button>
        <button class="save-to-course-button" data-place-id="${restaurant.id}" style='
          display: block;
          width: 100%;
          padding: 8px 12px;
          background-color: #f1f5f9;
          color: #334155;
          text-decoration: none;
          border-radius: 6px;
          text-align: center;
          font-weight: 500;
          font-size: 13px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
        '>
          코스에 저장하기
        </button>
      </div>
    </div>
  `;

  // This MUST be a CustomOverlay for getElement() to work.
  const descWindow = new window.kakao.maps.CustomOverlay({
    content: descWindowContent,
    position: marker.getPosition(),
    clickable: true, // This is crucial for the button to work.
    yAnchor: 1.2, // 오버레이 위치 조정 (마커에 더 가깝게)
    zIndex: 10, // Make sure it appears above other elements when open
  });

  return { nameWindow, descWindow };
}
