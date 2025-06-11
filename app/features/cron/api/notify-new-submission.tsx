import type { Route } from "./+types/notify-new-submission";

import { getPendingPlaces } from "./queries";

/**
 * API endpoint to check for new submissions in the last 24 hours
 * This is intended to be called by a cron job
 */
export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return new Response(null, { status: 404 });
  }

  const header = request.headers.get("X-POTATO");
  if (!header || header !== "X-TOMATO") {
    return new Response(null, { status: 404 });
  }

  const pendingPlaces = await getPendingPlaces(request);

  if (pendingPlaces.length > 0) {
    //send message to slack web hook with number of pending places
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!slackWebhookUrl) {
      console.error("SLACK_WEBHOOK_URL 환경 변수가 설정되지 않았습니다.");
      return;
    }
    const response = await fetch(slackWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: `검토되지 않은 추천 장소가 ${pendingPlaces.length}개 있습니다. 관리자 페이지를 확인해 주세요.`,
      }),
    });
    if (!response.ok) {
      console.error("Failed to send message to Slack");
    }
  }
};

// GET 요청을 위한 loader 추가
export const loader = async () => {
  return new Response("GET 요청은 지원하지 않습니다.");
};
