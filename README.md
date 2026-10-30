# 온에어 ON AIR — 항공 예약 UI/UX 포트폴리오

가상 항공사의 예약·탑승 준비 흐름을 체험하는 반응형 웹입니다. 기존 [yheun03/framework](https://github.com/yheun03/framework/)의 Nuxt 3 / Vue 3 / TypeScript / Pinia / SCSS와 공통 UI를 유지했습니다. 현재 폴더의 Git 원격은 `yheun03/flight-booking`이며, Framework 초기 복사본을 항공 프로젝트로 구성했습니다.

## 실행

Node.js 22와 npm을 권장합니다. 기존 package.json의 지원 범위는 `>=20 <23`입니다.

```bash
npm ci
npm run dev
# http://localhost:3000

npm run test:onair
npm run build
npm run generate
```

정적 결과물은 `.output/public`입니다. 브라우저 주소로 직접 접속해 사용합니다. HTML 파일을 `file://`로 열면 저장·라우팅이 정상 동작하지 않습니다.

프로젝트는 도메인 루트(`/`)를 기본 경로로 사용합니다. GitHub Pages의 `/flight-booking/` 등에 배포할 때에는 `project.config.ts`의 `baseURL`, `siteUrl`, package.json의 `homepage`를 실제 운영 주소와 일치시키거나 `NUXT_APP_BASE_URL`을 설정합니다. 현재 `siteUrl`은 로컬 개발용 주소입니다. 이번 작업에서는 원격 배포를 실행하지 않았습니다.

## 체험 순서

1. 홈에서 공항·날짜·인원을 선택하고 항공편을 검색합니다. 기본값은 오늘로부터 7일 후, 편도·1명·도쿄입니다.
2. 각 구간의 운임을 선택합니다. 왕복은 가는 편과 오는 편을 모두 선택합니다.
3. **가상 회원 정보 불러오기**로 탑승객과 연락처를 채웁니다. 실제 개인정보는 입력하지 마세요.
4. 가상 카드 또는 마일리지 결제를 선택하고 안내에 동의합니다. 실제 카드 번호나 인증 정보는 필요하지 않습니다.
5. 예약 완료 화면에서 예약 확인서와 서비스 진행 상태를 확인합니다.
6. 좌석 지정에서 구간·탑승객을 전환해 각각 좌석을 고릅니다. 선택 즉시 저장됩니다.
7. 기내식 화면에서 구간·탑승객별 메뉴를 선택합니다. 도쿄는 미제공입니다.
8. 헤더의 **체험 도구 → 날짜와 관계없이 체크인 허용**을 켭니다. 대상 구간·탑승객을 선택하고 정보·좌석·안내를 확인한 뒤 체크인합니다.
9. 탑승권에서 **인쇄 / PDF 저장**을 누릅니다. A4 용지를 사용하고, 필요하면 브라우저 인쇄 옵션의 머리글·바닥글을 끕니다. 체크인한 구간·탑승객의 탑승권만 표시됩니다.

왕복·2인은 파리 또는 방콕으로 체험하면 구간별 좌석과 기내식 차이를 확인하기 좋습니다. 파리 왕복·2인·라이트 기준 160,000M + 세금 448,000원입니다.

## 작은 데모 도구

헤더의 **체험 도구**는 일반 예약 UI와 구분된 Drawer입니다.

- 기본 가상 회원 잔액: 240,000M. **240,000 마일 충전**은 잔액을 해당 값으로 설정합니다.
- **100 마일로 변경**: 마일리지 부족을 재현합니다. 카드로 전환하거나 충전 후 재시도할 수 있습니다.
- **결제 실패 재현**: 실패해도 입력값은 유지되고 확정 예약·마일 차감은 발생하지 않습니다. 토글을 끈 뒤 재시도합니다.
- **날짜와 관계없이 체크인 허용**: 특정 과거 날짜에 의존하지 않고 체크인 흐름을 체험합니다.
- **데모 데이터 초기화**: 확인 모달 후 이 서비스의 예약·입력·좌석·기내식·마일리지 데이터를 초기화합니다.

## 가상 서비스 규칙

- 인천(ICN) ↔ 도쿄(NRT) / 방콕(BKK) / 파리(CDG), 직항·일반석만 지원합니다.
- 편도·왕복, 출발일 기준 만 19~120세 성인 1~2명만 지원합니다. 오늘 이후 모든 날짜에 하루 3편을 생성합니다. 왕복 오는 날은 가는 날 다음 날 이후이며 실제 도착보다 늦게 출발해야 합니다.
- 모든 가격·편명·시각·기종·수하물·운임 조건·마일·게이트는 프로젝트용 가상 데이터입니다. 변경·환불은 조건 안내만 제공하며 실행 기능은 없습니다.
- 편도 성인 1인 기본 라이트 운임: 도쿄 148,000원 + 세금 42,000원, 방콕 268,000원 + 세금 62,000원, 파리 628,000원 + 세금 112,000원입니다.
- 두 번째/세 번째 편의 운임은 각각 17,000원/34,000원 추가됩니다. 스탠다드는 35,000원, 플렉스는 85,000원이 추가됩니다.
- 마일리지 결제는 편도 1인 도쿄 15,000M, 방콕 25,000M, 파리 40,000M에 **별도 원화 세금**을 합산합니다. 스탠다드는 3,000M, 플렉스는 6,000M 추가입니다. 세금도 가상 결제이며 실제 청구되지 않습니다.
- 적립 예정 마일은 안내용이며 탑승 후 적립을 가정합니다. 실제 적립 기능은 없습니다. 결제 성공 때 필요한 마일 차감만 적용합니다.
- A321은 3–3 / 20열, B787-9는 3–3–3 / 24열의 축약된 가상 배치입니다. 일반석 무료 지정만 지원하며 10·11열 비상구와 점유 좌석은 선택할 수 없습니다.
- 도쿄는 기내식 미제공, 방콕·파리는 일반식/채식/과일식 무료 선택입니다. 선택하지 않은 메뉴는 체크인 때 일반식으로 확정합니다. 도쿄의 내부 기본값도 일반식으로 저장하지만 화면에는 미제공으로 안내합니다.
- 체크인은 출발 48시간 전~1시간 전입니다. 데모 허용 토글로 시간 조건만 우회할 수 있으며 좌석·대상·동의 검증은 유지합니다.
- 체크인 완료된 구간·탑승객의 좌석·기내식은 잠깁니다. 한 사람만 체크인하면 그 사람의 탑승권만 제공됩니다.
- 현지 시각: 인천 UTC+9, 도쿄 UTC+9, 방콕 UTC+7. **파리는 가상 고정 UTC+1이며 서머타임을 적용하지 않습니다.** 도착일이 다르면 실제 현지 도착 날짜를 표시합니다.
- 탑승 시각은 출발 40분 전, 게이트 D12, 그룹 2입니다. 코드에는 `DEMO-INVALID`를 포함하며 실제 탑승용 코드가 아닙니다.
- 가장 최근 확정 예약 1건을 관리합니다. 새 검색 중에도 기존 확정 예약은 유지되고 새 결제 성공 때 최근 예약으로 대체됩니다.

## 상태·파일 구조

- `project.config.ts`: project key `onair`, 브랜드·SEO·경로 설정
- `layouts/airline.vue`: 항공 헤더·메뉴·단계·푸터. 기존 관리자 레이아웃과 분리
- `pages/`: `/`, `/flights`, `/passengers`, `/payment`, `/confirmation`, `/my-booking`, `/seats`, `/meals`, `/check-in`, `/boarding-pass`, `/itinerary`
- `stores/onair.ts`: 결제 전 draft와 확정 booking 분리, 예약/마일 결제 및 구간·탑승객별 서비스 상태
- `utils/onair.ts`, `types/onair.ts`: 여러 화면이 공유하는 가상 운항 데이터·포맷·타입
- `components/projects/onair/`: 공통 예약 요약, 예약 상세, 서비스 전환, 데모 도구
- `assets/scss/projects/onair/`, `public/images/projects/onair/`: 프로젝트 토큰·스타일·이미지
- `i18n/projects/onair/ko.ts`, `en.ts`: 기존 사전에 함께 연결된 항공 텍스트
- `middleware/onair.global.ts`: 클라이언트 복원이 끝난 뒤 선행 상태·시간을 검사하는 라우팅 가드
- `plugins/onair.client.ts`: localStorage 복원과 입력 자동 저장. 관리자 페이지 탭 플러그인은 항공 레이아웃을 추적하지 않습니다.

브라우저 저장 키는 `onair:booking:v1`입니다. draft, 확정 예약, 잔액을 한 레코드에 기록합니다. 결제는 처리 중 재실행을 막고 transactionId로 중복 확정을 방지합니다. 지원 브라우저에서는 Web Locks로 여러 탭의 결제 확정을 직렬화합니다. 저장에 실패하면 결제 확정과 차감을 되돌립니다. 백엔드·인증·실제 카드 결제·외부 항공편 API는 사용하지 않습니다.

공통 컴포넌트 변경은 이번 흐름의 접근성에 필요한 입력 label/오류 연결, Select·Tabs 키보드 조작, Drawer·Modal의 포커스 제한과 복귀에 한정했습니다. body Teleport의 서버/클라이언트 불일치를 막기 위해 모달·토스트 호스트를 ClientOnly로 렌더링합니다.

## 검수

실제 실행한 시나리오와 확인 한계는 [검수 기록](./docs/ONAIR_QA.md)에 정리했습니다. 자동 검사는 `npm run test:onair`로 재현할 수 있습니다.

---

# Framework 원본 가이드

# Framework

Nuxt 3 기반의 Jonsoft 웹 퍼블리싱/프론트엔드 공통 프레임워크입니다.

공통 UI 컴포넌트, Pinia store, composable, SCSS 구조, demo 페이지를 포함하며  
새 화면을 만들 때 동일한 방식으로 개발할 수 있도록 기본 구조를 제공합니다.

## 기업별 프로젝트 시작하기

이 저장소를 새 기업 프로젝트로 복사한 뒤 아래 순서대로 수정합니다. 기업 정보와 전용 코드는 공통 코드에 섞지 않는 것을 원칙으로 합니다.

### 1. 프로젝트 정보와 SEO 수정

루트의 [`project.config.ts`](./project.config.ts) 한 파일에서 다음 항목을 변경합니다.

| 설정                | 용도                                         | 예시                                |
| ------------------- | -------------------------------------------- | ----------------------------------- |
| `key`               | 기업 전용 폴더명. 영문 kebab-case 사용       | `acme`                              |
| `companyName`       | 회사명, copyright 등에 사용                  | `ACME Corp.`                        |
| `serviceName`       | 서비스명, 화면 브랜드명, OG site name에 사용 | `ACME Works`                        |
| `locale`            | HTML/OG 언어                                 | `ko`                                |
| `baseURL`           | 앱이 배포되는 경로. 도메인 루트는 `/`        | `/works/`                           |
| `siteUrl`           | 운영 사이트의 절대 URL과 canonical URL       | `https://works.acme.com/`           |
| `favicon`           | `public/` 기준 파비콘 경로                   | `images/projects/acme/favicon.svg`  |
| `themeColor`        | 브라우저 UI용 대표 색상                      | `#0057B8`                           |
| `seo.title`         | 기본 브라우저/검색 결과 제목                 | `ACME Works`                        |
| `seo.titleTemplate` | 하위 페이지 title 규칙                       | `%s \| ACME Works`                  |
| `seo.description`   | 검색 결과 및 SNS 공유 설명                   | 기업별 설명                         |
| `seo.keywords`      | 검색 키워드 배열                             | `['ACME', 'ERP']`                   |
| `seo.ogImage`       | `public/` 기준 OG 이미지 경로                | `images/projects/acme/og-image.png` |
| `seo.ogImageAlt`    | OG 이미지 대체 문구                          | `ACME Works`                        |

`nuxt.config.ts`는 위 설정으로 title, description, canonical, favicon, theme color, Open Graph와 Twitter 메타 태그를 자동 생성합니다. 페이지별 title은 기업명을 붙이지 않고 다음처럼 화면명만 작성합니다.

```ts
useHead({ title: '로그인' });
```

그러면 `로그인 | ACME Works`처럼 `seo.titleTemplate`이 자동 적용됩니다.

> `siteUrl`은 반드시 실제 운영 주소로 변경합니다. 하위 경로에 배포하면 `baseURL`과 `siteUrl`에 같은 경로를 포함합니다. OG 이미지는 SNS 호환성을 위해 1200×630 크기의 PNG 또는 JPG를 권장합니다.

### 2. 기업별 색상 수정

기존 `framework` 폴더를 `project.config.ts`의 `key`와 같은 이름으로 복사하거나 변경합니다.

```text
assets/scss/projects/framework/
├── _theme.scss
└── index.scss

↓ key가 acme인 경우

assets/scss/projects/acme/
├── _theme.scss
└── index.scss
```

`_theme.scss`의 `$primary`, `$secondary`, `$tertiary`를 바꾸면 50~900 팔레트와 공통 컴포넌트 색상이 자동 생성됩니다. Header, LNB, Page Navigator만 다른 색이 필요한 경우 같은 파일의 `null` 값을 실제 색상으로 변경합니다.

```scss
$primary: #0057b8;
$secondary: #4b5563;
$tertiary: #003f87;

// 별도 지정이 필요한 항목만 변경
$lnb-background: linear-gradient(180deg, #003f87, #00295a);
```

`project.config.ts`의 `themeColor`도 `$primary`와 같은 값으로 맞춥니다. SCSS 색상은 컴파일 시 사용하고 `themeColor`는 브라우저 메타 태그에 사용하므로 두 값이 각각 필요합니다.

### 3. 이미지 교체

기업별 이미지는 다음 폴더에 모읍니다.

```text
public/images/projects/{key}/
├── favicon.svg
└── og-image.png
```

파일명이 다르면 `project.config.ts`의 `favicon`, `seo.ogImage` 경로도 함께 변경합니다. 정적 배포의 base URL은 자동 반영됩니다.

### 4. 기업 전용 컴포넌트와 SCSS 분리

공통 컴포넌트는 기존 `components/`에 유지하고, 특정 기업 또는 프로젝트에서만 사용하는 코드는 반드시 해당 `key` 폴더에 둡니다.

```text
components/
├── AppButton/                       # 모든 프로젝트 공통
└── projects/
    └── acme/
        ├── AcmeDashboardSummary.vue
        └── AcmeOrderStatus.vue

assets/scss/
├── components/base/                 # 모든 프로젝트 공통
└── projects/
    └── acme/
        ├── _theme.scss              # 기업 테마 토큰
        ├── _dashboard.scss          # 기업 전용 화면/컴포넌트 스타일
        └── index.scss               # 기업 전용 SCSS 진입점
```

기업 전용 컴포넌트는 활성 프로젝트 폴더만 Nuxt에 자동 등록됩니다. 파일명은 다른 프로젝트와 충돌하지 않도록 `Acme`처럼 기업명 또는 프로젝트명 prefix를 붙입니다.

기업 전용 SCSS 파일은 `index.scss`에서 불러옵니다.

```scss
@use 'dashboard';
```

공통으로 쓸 가능성이 있다는 이유만으로 먼저 공통 폴더에 넣지 않습니다. 실제로 여러 프로젝트에서 동일하게 사용하는 것이 확인된 컴포넌트만 공통 영역으로 이동합니다.

### 5. 신규 프로젝트 체크리스트

```text
[ ] project.config.ts의 key, 회사명, 서비스명 수정
[ ] baseURL, siteUrl, title, description, keywords 수정
[ ] favicon, OG 이미지 교체 및 경로 확인
[ ] assets/scss/projects/{key}/_theme.scss 색상 수정
[ ] themeColor와 $primary 값 일치 확인
[ ] components/projects/{key}/ 폴더 생성
[ ] assets/scss/projects/{key}/index.scss 생성
[ ] npm run build로 경로와 SCSS 컴파일 확인
[ ] 배포된 페이지 소스에서 title/description/og:image/canonical 확인
```

## Stack

- Nuxt 3 / Vue 3
- Pinia
- Axios
- SCSS
- AG Grid
- Chart.js
- i18n

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run generate
```

## Documents

- 개발 규칙: [`DEVELOPMENT_GUIDE.md`](./DEVELOPMENT_GUIDE.md)
- 컴포넌트 목록 / 공통 속성 규칙: [`COMPONENT_GUIDE.md`](./COMPONENT_GUIDE.md)
