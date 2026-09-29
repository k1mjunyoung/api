# CLAUDE.md

## 프로젝트 개요

백엔드 개발자 포트폴리오 데모 사이트. 컨셉은 **"크롬에서 REST API 응답(JSON)을 직접 열었을 때의 화면"** 이다.
페이지 자체가 하나의 API 응답처럼 보여야 하며, 일반적인 포트폴리오 레이아웃(히어로, 카드, 섹션 등)을 추가하지 않는다.

- 스택: **순수 HTML / CSS / JS만 사용** (프레임워크, 번들러, 빌드 단계, npm 의존성 없음)
- 파일 구조: 현재 `index.html` 단일 파일 (CSS는 `<style>`, JS는 `<script>` 인라인)
- 배포 대상: 정적 호스팅 (GitHub Pages 등)
- 로컬 실행: `index.html`을 브라우저로 열거나 `python3 -m http.server`

## 디자인 원칙

이 컨셉이 프로젝트의 핵심이므로 변경 시 아래를 유지한다.

- 화면 구성은 위에서 아래로: 가짜 브라우저 탭/주소창 → 응답 메타바(`GET`, `200 OK`, `content-type`) → JSON 트리 → 하단 주석 한 줄
- JSON 본문은 **모노스페이스**, 브라우저/메타바 UI는 시스템 산세리프 폰트로 구분
- 신택스 색상은 키(보라), 문자열(붉은색), 숫자·불리언(파랑), null(회색), 구두점(본문색)
- 문자열이 `http(s)://`로 시작하면 따옴표 안쪽만 실제 `<a>` 링크로 렌더링 (크롬 뷰어 동작과 동일)
- 노드를 접으면 `N keys` / `N items` 요약을 표시

## 코드 구조 (`index.html`)

### CSS
- 색상은 전부 `:root`의 CSS 변수(토큰)로 정의한다. 하드코딩 색상을 새로 추가하지 말 것.
- 다크모드는 3곳을 항상 같이 수정한다.
  1. `:root` (라이트 기본값)
  2. `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ... } }`
  3. `:root[data-theme="dark"] { ... }`
- `:root`에 `env(safe-area-inset-*)` 패딩이 있다 (모바일 노치 대응). 제거하지 말 것.
- 트리 접기/펴기는 `.node.collapsed` 클래스 하나로 제어하고, 표시/숨김은 CSS 후손 선택자로 처리한다.

### JS
- 데이터는 `data` 객체 리터럴 하나가 단일 소스다. 내용을 바꾸려면 이 객체만 수정하면 트리와 Raw 뷰가 모두 갱신된다.
- `renderNode(parent, value, key, isLast, depth)`가 재귀적으로 트리 DOM을 만든다.
  - 프리미티브: 한 줄(`.line`)
  - 객체/배열: `.node` 래퍼 안에 헤더 줄, `.children`, 닫는 줄(`.close-line`)
  - 마지막 항목이 아니면 쉼표를 붙인다 (`isLast`)
- 문자열은 반드시 `textContent` / `JSON.stringify`로 삽입한다. 사용자 데이터를 `innerHTML`로 넣지 말 것.
- Parsed/Raw 전환은 `body.raw-mode` 클래스로 처리한다.
- Copy 버튼은 `navigator.clipboard`를 쓰고 실패하면 `execCommand("copy")`로 폴백한다.

## 작업 규칙

- 외부 라이브러리, CDN, 웹폰트를 추가하지 않는다. 필요하면 먼저 확인을 받는다.
- 모바일(좁은 화면)에서 가로 스크롤 없이 읽혀야 한다. 긴 문자열은 줄바꿈된다.
- 접근성: 화살표 토글은 현재 `span` + 클릭 이벤트다. 키보드 접근성을 개선할 때는 `button`으로 바꾸거나 `tabindex`/`Enter` 처리를 추가한다.
- 콘텐츠(JSON 필드)는 사용자가 정한 내용이다. 임의로 필드를 추가하거나 문구를 바꾸지 말고, 변경이 필요하면 제안 후 진행한다.
- 커밋 메시지, 주석은 한국어 또는 영어 어느 쪽이든 무방하나 한 파일 안에서는 통일한다.

## 확장 아이디어 (요청 시에만 진행)

- CSS/JS를 `style.css`, `script.js`로 분리하고 `data`를 `data.json`으로 이동 (이 경우 `fetch`를 쓰므로 로컬 서버 필요)
- 라이트/다크 수동 전환 버튼 (`data-theme` 속성 이미 지원)
- 프로젝트 목록 같은 필드를 JSON에 추가 (`projects: [{ name, stack, repo }]` 형태로 트리에 자연스럽게 녹일 것)
- 키보드로 트리 접기/펴기, 검색 기능
