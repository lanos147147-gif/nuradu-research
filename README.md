# NURadu Research · X 아티클 자동 아카이브 (v3)

웹사이트 `website/`에는 기존 디자인, 검색, 분야별 필터, X 공개 타임라인이 그대로 있습니다. **새 기능:** 공식 X API로 `@NURadu_`의 장문 아티클 게시물을 가져와 `website/articles-auto.js`에 등록하고, GitHub Actions로 2시간마다 동기화합니다. 코드는 제공됐지만 **아직 본인 계정 API 토큰을 연결하거나 실제 사이트에 배포한 상태가 아닙니다.** X 계정의 비밀번호는 필요 없습니다. 토큰을 채팅이나 웹사이트 코드에 붙여 넣지 마세요.

## 빠른 설치 — GitHub Pages 방식 (추천)

1. https://github.com/new 에서 본인 소유 저장소를 만들고, 이 ZIP 안의 **`nuradu-research` 폴더 내부 파일 전부**를 저장소 최상위(root)에 업로드합니다. `.github/workflows/sync-and-deploy.yml` 폴더까지 반드시 포함하세요. 기본 브랜치 이름은 `main`으로 맞춰 주세요. `editor.html`, `scripts/`, `sync/`, `tests/`, `website/`가 저장소 최상위에 보이면 됩니다.
2. 저장소 Settings → Pages → Build and deployment → Source를 **GitHub Actions**로 지정합니다. Actions가 허용돼 있어야 하며, Actions → General → Workflow permissions에서 필요한 `Read and write permissions` 설정이 허용되는지 확인하세요. 정책에 따라 제한될 수 있습니다.
3. https://console.x.com 또는 https://developer.x.com 에서 X 개발자 앱을 생성하고, 읽기 가능한 **앱 Bearer Token을 우선** 발급받습니다. 앱 토큰이 계정의 필요한 필드를 조회할 수 없는 경우 OAuth 2.0 사용자 액세스 토큰과 `tweet.read`, `users.read` 등 필요한 범위를 확인하세요. 단, **짧은 수명의 OAuth 2.0 사용자 토큰을 사용하면 만료 전 별도의 갱신·교체가 필요합니다**. 이 스타터에는 OAuth 재로그인이나 refresh token 영구 보관 절차는 포함하지 않았습니다. 유료 사용량 API이므로 **X 개발자 콘솔의 spending limit**을 먼저 낮게 설정하세요. X Premium/X 유료 구독과 X 개발자 API 이용료는 별개입니다.
4. GitHub 저장소 Settings → Secrets and variables → Actions → **Secrets** → New repository secret에서 이름을 `X_ACCESS_TOKEN` 또는 `X_BEARER_TOKEN`으로 넣고 토큰 값을 저장하세요. **토큰 값을 이 ZIP 안이나 채팅, GitHub 커밋에 절대로 넣지 마세요.** 두 종류 중 한 가지만 있어도 됩니다. 지속 운영에는 읽기가 허용되는 앱 `X_BEARER_TOKEN`을 권장합니다. `X_ACCESS_TOKEN`이 함께 설정되면 우선 사용됩니다. 권한 부족으로 401/403이 발생하면 X 개발자 콘솔에서 올바른 읽기 권한 토큰을 발급받아 교체해야 합니다.
5. GitHub 저장소의 Settings → Secrets and variables → Actions → **Variables**에 선택적으로 `X_USER_ID`(NURadu_ 계정의 숫자 ID)를 넣으면 사용자 ID 조회 비용을 아낄 수 있습니다. 비워두면 최초 동기화 때 공식 사용자 조회 API를 통해 계정명을 확인한 뒤 ID를 저장합니다. 첫 실행에서 기존 글을 최대 500게시물 내에서 찾도록 `X_INITIAL_PAGES=5`를 설정할 수 있습니다. 더 오래된 글까지 첫 동기화하려면 1~32 범위에서 늘리세요 (1페이지=최대 100게시물; 과금량도 늘어납니다). 기본값은 5입니다.
6. 저장소 Actions → **Sync X articles and publish website** → Run workflow 클릭. 성공하면 `website/articles-auto.js`, `sync/articles-auto.json`, `sync/x-sync-state.json`이 갱신됩니다. Pages 주소는 저장소 Settings → Pages 또는 워크플로의 Deploy 단계에서 확인할 수 있습니다. 이후 기본적으로 **2시간마다 자동 갱신**합니다. GitHub 스케줄러에 따라 지연될 수 있고, API 오류·크레딧 소진 시 기존 목록을 유지하고 워크플로는 실패로 표시됩니다.

## 데이터 흐름

```
NURadu_ 장문 아티클 게시 → GitHub Actions 2시간 간격 실행
  → GET /2/users/{id}/tweets (공식 X API)
  → post.fields=article,article_title,... 로 장문 아티클 선별
  → 아티클 제목 / 일반적인 분야 소개문 / 날짜(한국시간) / 태그 / 분야 추정
  → X 게시물 ID로 기존 글과 중복 제거
  → website/articles-auto.js 갱신 → GitHub Pages 자동 재배포
  → 독자는 카드 클릭 시 원래 X 게시물로 이동
```

분류는 현재 키워드 규칙 기반이며 완벽한 AI 의미 분석은 아닙니다. 저널·회사 특성에 따라 수동 조정이 필요할 수 있습니다. **구독자 전용 아티클의 일부 본문이 API에 응답으로 포함되더라도 공개 사이트에 저장하지 않도록 소개문은 자동 생성합니다. 구독자 전용인지 여부는 X 타임라인 응답만으로 신뢰성 있게 확인할 수 없으므로**, 자동 수집 글에는 `X에서 열람 확인`으로 표시하고 원문 접근 권한은 X에 맡깁니다. API가 `article` 필드를 반환하지 않는 게시물은 자동으로 분류되지 않을 수 있습니다. `editor.html`에서 직접 추가하는 우회 경로가 있습니다.

이미 자동 수집된 글을 수동으로 교정하려면 `editor.html`에서 해당 원문의 동일한 X `.../status/게시물ID` 링크로 새 글을 만들고 `website/articles.js`로 내보내세요. 홈페이지에서는 수동 등록이 우선되어 중복 카드가 생기지 않습니다. 수동 등록 글이 하나라도 있으면 디자인 확인용 가짜 샘플이 자동으로 숨겨집니다.

## 운영비 주의 (2026년 10월 2일 확인)

X 공식 Pay-per-use API는 게시물 조회가 반환 리소스당 $0.005입니다. 본인 소유 개발자 앱에서 인증 사용자 ID로 해당 사용자의 데이터를 조회할 경우 Owned Reads 우대 요금 $0.001/리소스가 적용되는 조건이 있습니다. 일반 Bearer Token만 설정했다고 우대 요금이 자동 보장되지는 않습니다. X 개발자 콘솔에서 본인 실제 과금 내역, 선불 크레딧, 지출 한도를 확인하세요. 공식 안내: https://docs.x.com/x-api/getting-started/pricing

정기 작업은 `since_id`를 사용하여 이전 동기화 이후 게시물만 불러오고, 중복 리소스 과금은 X 정책의 24시간 UTC 중복제거 조건에 따릅니다. 첫 실행은 최근 500게시물(기본 설정)만 살펴보므로 **그보다 이전의 모든 X 글이 자동으로 들어오는 것은 아닙니다**. 초기에 누락된 오래된 아티클은 수동 편집기로 추가하거나 첫 동기화 전에 `X_INITIAL_PAGES`를 늘려 주세요. 정상 증분 실행 중 한도(최대 32페이지)에 닿으면 누락된 상태로 기준점을 앞으로 옮기지 않고 에러로 중단합니다.

## 파일 설명

- `website/index.html`, `website/styles.css`, `website/app.js`: 독자에게 보이는 정적 라이브러리
- `website/articles.js`: 본인이 수동 입력한 글 (샘플 12개 포함)
- `website/articles-auto.js`: 공식 X API로 받아 자동 생성된 메타데이터, **비밀키 없음**
- `website/live.html`: X 공식 임베드 타임라인 (외부 위젯 로드 여부는 방문자 브라우저 정책에 좌우됨)
- `editor.html`: 브라우저용 수동 편집기 (실제 배포에는 `website/` 폴더만 사용)
- `scripts/sync-core.mjs`: 본인 아티클 판별, 분류, 중복제거 로직
- `scripts/sync-x.mjs`: 실제 X API 조회 및 데이터 업데이트 스크립트
- `sync/articles-auto.json`, `sync/x-sync-state.json`: 자동 수집 데이터와 마지막 확인한 게시물 ID (제목·키워드·원문 링크 등 최소 메타데이터만 저장)
- `.github/workflows/sync-and-deploy.yml`: 검증 → 2시간 정기 수집 → 변경 사항 자동 커밋 → GitHub Pages 배포
- `tests/sync-core.test.mjs`: 계정 URL 보안, 날짜, 중복제거, 게시물 필터 단위 검사

### 직접 검사

```
node --test tests/*.test.mjs
node scripts/sync-x.mjs --fixture tests/mock-x-response.json
```

테스트용 fixture 명령은 데이터 파일을 **수정하지 않으며**, 실제 X API를 호출하거나 비용을 발생시키지 않습니다.

## 기존 Netlify Drop 사용자 주의

기존처럼 `website/` 폴더만 Netlify Drop에 올리면 **그 시점의 정적 데이터만** 공개됩니다. 이후 GitHub Actions가 동기화한 내용은 Netlify Drop 사이트로 저절로 배포되지 않습니다. 자동 배포까지 원한다면 **GitHub Pages로 공개**하거나 **Netlify를 GitHub 저장소에 연결하고 publish directory를 `website`로 설정**하세요. GitHub에 동기화 커밋이 생기면 Netlify가 재배포하게 구성할 수 있습니다.

## X API 문서

- 사용자 게시물: https://docs.x.com/x-api/users/get-posts (`post.fields=article,article_title`)
- 사용자 타임라인 개요: https://docs.x.com/x-api/posts/timelines/introduction
- 과금과 본인 글 요금: https://docs.x.com/x-api/getting-started/pricing
- X Articles 소개: https://help.x.com/en/using-x/articles

보안상 사이트 코드는 X에 로그인하지 않습니다. 회원 전용 본문이나 쿠키를 수집·공개하지 않고, 검색용 메타데이터와 원문 URL만 저장합니다. 공식 X API가 허용한 범위에서 동작합니다.
