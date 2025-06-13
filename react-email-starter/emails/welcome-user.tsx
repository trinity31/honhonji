import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://honhonji.space";

export default function WelcomeUser({ username }: { username: string }) {
  return (
    <Html>
      <Preview>
        {username}님, 혼혼지에 오신 걸 환영해요! 지금 주변의 혼밥 식당과
        산책길을 확인해보세요 🗺️
      </Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto max-w-2xl bg-white p-0 shadow-sm">
            {/* 헤더 */}
            <Section className="bg-gradient-to-r from-rose-600 to-rose-400 p-8 text-center text-white">
              <Heading as="h1" className="mb-4 text-3xl font-bold">
                {username}님, 혼혼지에 오신 걸 환영해요!
              </Heading>
              <Text className="text-xl">
                혼자 있는 시간이 더 좋아지는 지도, 지금 시작해볼까요?
              </Text>
            </Section>

            {/* 소개 메시지 */}
            <Section className="p-8">
              <Text className="text-lg">
                안녕하세요,{" "}
                <span className="font-bold text-rose-600">{username}</span>님!
              </Text>
              <Text className="mt-4 text-gray-700">
                혼혼지는 <strong>내 주변의 혼밥하기 좋은 맛집과 산책길</strong>
                을 추천해주는 지도 서비스예요. 지금은{" "}
                <strong>주변 식당 보기</strong>와 <strong>장소 추천</strong>{" "}
                기능만 제공되고 있지만, 앞으로{" "}
                <strong>나만의 맛집 지도 만들기</strong>,{" "}
                <strong>혼자 걷는 사람들의 커뮤니티</strong> 등도 차차 열릴
                예정이에요.
              </Text>

              {/* 지금 할 수 있는 일 */}
              <Section className="mt-8 rounded-lg border border-rose-100 bg-rose-50 p-6">
                <Heading
                  as="h2"
                  className="mb-4 text-xl font-bold text-gray-800"
                >
                  지금 할 수 있는 일
                </Heading>
                <Row className="mb-4">
                  <Column className="w-8">📍</Column>
                  <Column className="pl-2">
                    <Text className="m-0 font-semibold">
                      주변 혼밥 식당 찾아보기
                    </Text>
                    <Text className="m-0 text-sm text-gray-600">
                      1인석, 가성비, 콘센트, 아침식사 등으로 선택 가능
                    </Text>
                  </Column>
                </Row>
                <Row className="mb-4">
                  <Column className="w-8">🚶</Column>
                  <Column className="pl-2">
                    <Text className="m-0 font-semibold">
                      조용한 산책 코스 확인하기
                    </Text>
                    <Text className="m-0 text-sm text-gray-600">
                      거리, 볼거리, 분위기 등으로 선택 가능
                    </Text>
                  </Column>
                </Row>
                <Row>
                  <Column className="w-8">📝</Column>
                  <Column className="pl-2">
                    <Text className="m-0 font-semibold">
                      직접 장소 제보하기
                    </Text>
                    <Text className="m-0 text-sm text-gray-600">
                      여러분의 추천으로 혼혼지 지도를 함께 만들어요!
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* CTA */}
              <Section className="mt-8 text-center">
                <Text className="mb-4 text-lg font-semibold">
                  지금 바로 내 주변을 탐색해보세요 🧭
                </Text>
                <Button
                  href="https://honhonji.space"
                  className="inline-block rounded-full bg-rose-600 px-8 py-4 text-lg font-semibold text-white hover:bg-rose-700"
                >
                  혼밥 식당 보러가기
                </Button>
              </Section>
            </Section>

            {/* 푸터 */}
            <Section className="border-t border-gray-200 bg-gray-50 px-8 py-6 text-center text-sm text-gray-500">
              <Text className="mb-2">
                <Link href="#" className="text-gray-600 hover:underline">
                  이용약관
                </Link>{" "}
                |
                <Link href="#" className="ml-2 text-gray-600 hover:underline">
                  개인정보처리방침
                </Link>
              </Text>
              <Text className="mb-2">
                문의하기:{" "}
                <Link
                  href="mailto:help@honhonji.space"
                  className="text-rose-600"
                >
                  help@honhonji.space
                </Link>
              </Text>
              <Text className="text-xs">
                {new Date().getFullYear()} 혼혼지. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
