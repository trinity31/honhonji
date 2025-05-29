/**
 * 지도에 표시할 커스텀 오버레이를 생성하는 함수
 *
 * @param marker - 카카오맵 마커 객체
 * @param restaurant - 식당 정보 객체 (name, description 필드 필요)
 * @returns 생성된 nameWindow와 descWindow 객체
 */
export function createCustomOverlays(
  marker: any,
  restaurant: { name: string; description: string | null },
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
    yAnchor: 2.1, // 마커 아래에 더 멀리 위치하도록 조정
    zIndex: 1, // 마커보다 낮은 z-index로 마커가 위에 오도록 함
  });

  const descWindow = new window.kakao.maps.CustomOverlay({
    position: marker.getPosition(),
    content: `
                  <div style='
                    padding: 16px;
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.12);
                    font-size: 14px;
                    line-height: 1.5;
                    color: #333;
                    min-width: 160px;
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
                    '>${restaurant.description || "설명이 없습니다."}</div>
                  </div>
                `,
    yAnchor: 1.5,
    zIndex: 2, // nameWindow보다 높은 z-index로 설정
  });

  return { nameWindow, descWindow };
}
