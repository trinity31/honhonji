import { MapPin, Search, Utensils, Star, Filter, Menu, Coffee, Pizza } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-slate-950">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">메뉴</span>
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <Utensils className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">혼혼지</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="font-medium transition-colors hover:text-primary">
              홈
            </Link>
            <Link href="#" className="font-medium text-muted-foreground transition-colors hover:text-primary">
              식당 지도
            </Link>
            <Link href="#" className="font-medium text-muted-foreground transition-colors hover:text-primary">
              식당 제보
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-secondary hover:text-secondary/80 hover:bg-secondary/10"
            >
              <Link href="/signin">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="bg-primary hover:bg-primary/90">
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-6 md:py-12 bg-primary/10 dark:bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary">
                  나만의 맛집, 나만의 길.
                </h1>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  혼자여도 특별한 한 끼와 식책을 발견하세요!
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  혼혼지는 1인가구를 위한 맞춤형 혼밥 추천 서비스입니다. 주변의 혼밥하기 좋은 식당을 찾아보세요.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button className="gap-1 bg-primary hover:bg-primary/90">
                  <MapPin className="h-4 w-4" />내 주변 식당 찾기
                </Button>
                <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
                  추천 식당 둘러보기
                </Button>
              </div>
            </div>
            <div className="mx-auto flex w-full items-center justify-center">
              <Card className="w-full overflow-hidden border-none shadow-lg">
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <img
                      src="/placeholder.svg?height=400&width=800&text=오늘의+추천+맛집"
                      alt="혼밥 이미지"
                      className="object-cover"
                      width={800}
                      height={400}
                    />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-lg font-medium text-white">오늘의 추천 식당</p>
                      <p className="text-sm text-white/80">혼자서도 편안하게 즐길 수 있는 맛집</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <div className="container px-4 py-4 md:px-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Badge
            variant="outline"
            className="bg-red-100 text-red-600 hover:bg-red-200 border-red-200 px-3 py-1 rounded-full"
          >
            <Utensils className="mr-1 h-3 w-3" /> 한식
          </Badge>
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-600 hover:bg-blue-200 border-blue-200 px-3 py-1 rounded-full"
          >
            <Coffee className="mr-1 h-3 w-3" /> 카페
          </Badge>
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-600 hover:bg-yellow-200 border-yellow-200 px-3 py-1 rounded-full"
          >
            <Pizza className="mr-1 h-3 w-3" /> 양식
          </Badge>
          <Badge
            variant="outline"
            className="bg-green-100 text-green-600 hover:bg-green-200 border-green-200 px-3 py-1 rounded-full"
          >
            혼밥 맛집
          </Badge>
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-600 hover:bg-purple-200 border-purple-200 px-3 py-1 rounded-full"
          >
            1인석 있음
          </Badge>
          <Badge
            variant="outline"
            className="bg-orange-100 text-orange-600 hover:bg-orange-200 border-orange-200 px-3 py-1 rounded-full"
          >
            가성비
          </Badge>
          <Badge
            variant="outline"
            className="bg-teal-100 text-teal-600 hover:bg-teal-200 border-teal-200 px-3 py-1 rounded-full"
          >
            신규 오픈
          </Badge>
        </div>
      </div>

      {/* Main Content with Map */}
      <main className="flex-1">
        <div className="container px-4 py-6 md:px-6 md:py-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary">주변 혼밥 식당</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1 border-secondary text-secondary hover:bg-secondary/10"
              >
                <Filter className="h-4 w-4" />
                필터
              </Button>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="식당 검색..."
                  className="w-full rounded-md pl-8 md:w-[200px] lg:w-[300px]"
                />
              </div>
            </div>
          </div>

          <Tabs defaultValue="map" className="w-full">
            <TabsList className="mb-4 bg-muted/50">
              <TabsTrigger value="map" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                지도 보기
              </TabsTrigger>
              <TabsTrigger value="list" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                목록 보기
              </TabsTrigger>
            </TabsList>
            <TabsContent value="map" className="mt-0">
              <div className="relative w-full rounded-lg border overflow-hidden shadow-lg">
                {/* Map View */}
                <div className="aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1] w-full bg-muted relative">
                  <div className="absolute inset-0">
                    <img
                      src="/placeholder.svg?height=800&width=1600&text=지도+영역"
                      alt="지도"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Map Markers */}
                  <div className="absolute left-[20%] top-[30%]">
                    <div className="relative">
                      <div className="absolute -top-10 -left-24 w-48">
                        <Card className="border shadow-lg">
                          <CardContent className="p-2">
                            <div className="flex items-center gap-2">
                              <div className="h-10 w-10 rounded-md bg-primary/20 flex items-center justify-center">
                                <Utensils className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">혼밥 파스타</p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span>4.8</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                        <MapPin className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute left-[50%] top-[60%]">
                    <div className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shadow-lg">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="absolute left-[70%] top-[40%]">
                    <div className="h-8 w-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="absolute left-[35%] top-[50%]">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="list">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all">
                    <CardContent className="p-0">
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={`/placeholder.svg?height=200&width=400&text=식당+${i}`}
                          alt={`식당 ${i}`}
                          className="h-full w-full object-cover transition-all hover:scale-105"
                        />
                        <Badge className="absolute left-2 top-2" variant="secondary">
                          1인석 있음
                        </Badge>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-primary">혼밥 맛집 {i}</h3>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{(4 + i * 0.1).toFixed(1)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">한식 • 1인석 • 혼밥 친화적</p>
                        <p className="text-sm">서울시 강남구 역삼동</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-8 bg-muted/30">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">© 2024 혼혼지. 모든 권리 보유.</p>
          </div>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
              이용약관
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-secondary">
              개인정보 처리방침
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-accent">
              문의하기
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
