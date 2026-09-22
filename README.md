# TO DO

할 일 / 진행 중 / 완료 열이 있는 칸반 보드입니다. 카드는 드래그로 옮기고, 제목·설명은 추가·수정·삭제할 수 있습니다. 보드 내용은 이 브라우저에만 저장됩니다.

- 테마: **블랙**, **베이직**
- 제목과 색은 팔레트에서 바꿀 수 있습니다

## 로컬에서 실행

```bash
npm install
npm run dev
```

브라우저에서 개발 서버가 뗭니다. 이 프로젝트는 Grok App Builder 스캐폴드(TanStack Start + Vite)입니다.

## Vercel에 올리기

1. [vercel.com](https://vercel.com)에 GitHub로 로그인합니다.
2. **Add New Project** → `kookoo-commits/todo-kanban` 저장소를 고릅니다.
3. Framework Preset는 Vite / 기본값 그대로 두고 **Deploy**를 누릅니다.

Hobby(무료) 플랜으로 개인 프로젝트는 보통 충분합니다. 본인 도메인을 붙이려면 Vercel 프로젝트의 Domains에서 추가하면 됩니다.

## 참고

카드 데이터는 서버가 아니라 각 사용자의 브라우저(`localStorage`)에 있습니다. 다른 기기·다른 사람과 보드가 공유되지 않습니다.
