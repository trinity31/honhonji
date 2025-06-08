import type { Route } from "../../../core/layouts/+types/private.layout";

import { useState } from "react";
import { Form, useNavigate } from "react-router";

import { Button } from "../../../core/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../core/components/ui/card";
import makeSSRClient from "../../../core/lib/supa-client.server";

// 서버 액션 - 사용자 역할 업데이트
export async function action({ request }: Route.ActionArgs) {
  const [client] = makeSSRClient(request);
  
  const { data, error } = await client.auth.updateUser({
    data: { role: 'admin' }
  });
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true, user: data.user };
}

export default function SetAdminRolePage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = () => {
    setIsUpdating(true);
  };
  
  return (
    <div className="container max-w-md py-8">
      <Card>
        <CardHeader>
          <CardTitle>관리자 권한 설정</CardTitle>
          <CardDescription>
            현재 로그인된 사용자에게 관리자 권한을 부여합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            관리자 권한을 부여하면 대시보드 메뉴가 표시되고 관리자 기능에 접근할 수 있습니다.
            이 작업은 되돌릴 수 없으니 신중하게 진행하세요.
          </p>
          <Form method="post" onSubmit={handleSubmit}>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "처리 중..." : "관리자 권한 부여하기"}
            </Button>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            취소
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
