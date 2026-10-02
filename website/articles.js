/*
 NURadu Research · 글 데이터
 새 글을 추가할 때는 이 목록에 객체 하나를 복사해서 넣으면 됩니다.
 editor.html(압축파일의 상위 폴더)을 사용하면 코드를 직접 수정하지 않아도 됩니다.
 url: 반드시 본인의 X 원문 URL을 넣으세요. 빈 값이면 원문 버튼이 비활성화됩니다.
 demo: 실제 게시 글을 등록한 뒤 false로 바꾸면 샘플 표시가 사라집니다.
 date: YYYY-MM-DD / access: "free" 또는 "subscriber"
*/
window.NURADU_ARTICLES = [
  {
    id: "power-time",
    title: "우리는 전력이 아니라 시간을 구매하는 겁니다",
    summary: "미국 BTM 발전 시장에서 중요한 것은 발전기의 숫자뿐 아니라 전력 확보까지 걸리는 시간이라는 관점.",
    date: "2026-10-02",
    category: "전력·인프라",
    tags: ["BTM", "EROC", "INIO", "데이터센터"],
    access: "subscriber",
    url: "",
    cover: "power",
    featured: true,
    readMinutes: 12,
    demo: true
  },
  {
    id: "rare-earth",
    title: "미국 희토류 패권의 균열인가, 거대한 기회인가?",
    summary: "채굴에서 정제, 자석 생산까지 이어지는 희토류 공급망의 구조와 미국 기업의 위치.",
    date: "2026-10-02",
    category: "자원·공급망",
    tags: ["MP", "USAR", "희토류"],
    access: "subscriber",
    url: "",
    cover: "rare",
    readMinutes: 14,
    demo: true
  },
  {
    id: "drone-dominance",
    title: "Drone Dominance, 미국 드론 공급망을 읽는 법",
    summary: "드론 완제품과 부품 공급업체를 나누어 산업의 실제 수혜 경로를 검토합니다.",
    date: "2026-10-01",
    category: "방산·우주",
    tags: ["ONDS", "UMAC", "AVAV", "KTOS"],
    access: "subscriber",
    url: "",
    cover: "aero",
    readMinutes: 10,
    demo: true
  },
  {
    id: "bottom-monthly",
    title: "월봉 바닥을 볼 때 놓치지 말아야 할 것",
    summary: "차트만이 아니라 현금흐름과 펀더멘털을 함께 봐야 하는 이유.",
    date: "2026-09-30",
    category: "투자 프레임워크",
    tags: ["월봉", "밸류에이션", "리스크"],
    access: "free",
    url: "",
    cover: "framework",
    readMinutes: 6,
    demo: true
  },
  {
    id: "glass-substrate",
    title: "반도체 패키징의 다음 변화, 유리기판",
    summary: "AI 연산 확대와 첨단 패키징에서 소재와 공정의 변화를 살펴봅니다.",
    date: "2026-09-25",
    category: "반도체·기술",
    tags: ["코닝", "유리기판", "패키징"],
    access: "free",
    url: "",
    cover: "semi",
    readMinutes: 8,
    demo: true
  },
  {
    id: "mram-space",
    title: "우주 컴퓨팅 시대와 MRAM의 가능성",
    summary: "우주 환경에서 메모리 기술을 볼 때 검토해야 할 장점과 한계.",
    date: "2026-09-25",
    category: "반도체·기술",
    tags: ["MRAM", "NVE", "우주 컴퓨팅"],
    access: "subscriber",
    url: "",
    cover: "semi",
    readMinutes: 9,
    demo: true
  },
  {
    id: "blackberry",
    title: "블랙베리의 실적과 밸류에이션을 연결하기",
    summary: "기업의 변화가 실적으로 확인되는 과정과 이미 가격에 반영된 기대를 구분합니다.",
    date: "2026-09-24",
    category: "기업 분석",
    tags: ["BB", "실적", "밸류에이션"],
    access: "subscriber",
    url: "",
    cover: "company",
    readMinutes: 11,
    demo: true
  },
  {
    id: "eroc-inio",
    title: "EROC와 INIO, 2030년까지의 성장 동력",
    summary: "기업별 사업 구조와 성장 변수, 경영진 이력에 대해 비교 검토합니다.",
    date: "2026-09-19",
    category: "기업 분석",
    tags: ["EROC", "INIO", "전력"],
    access: "subscriber",
    url: "",
    cover: "company",
    readMinutes: 15,
    demo: true
  },
  {
    id: "fsi",
    title: "금융 스트레스 지수로 시장의 온도 읽기",
    summary: "주가만 보고 판단하기 어려울 때 금융 시스템 전반의 위험 신호를 해석하는 방법.",
    date: "2026-09-18",
    category: "거시경제",
    tags: ["FSI", "리스크", "금융시장"],
    access: "free",
    url: "",
    cover: "macro",
    readMinutes: 9,
    demo: true
  },
  {
    id: "marketcap",
    title: "시가총액만 보면 안 되는 이유",
    summary: "주당 가격과 기업가치의 차이에서 출발하는 투자 기초 개념.",
    date: "2026-09-15",
    category: "투자 프레임워크",
    tags: ["시가총액", "기업가치", "입문"],
    access: "free",
    url: "",
    cover: "framework",
    readMinutes: 5,
    demo: true
  },
  {
    id: "dilution",
    title: "희석이 기존 주주에게 미치는 영향",
    summary: "자금 조달이 기업에는 기회이면서 주주에게는 부담이 될 수 있는 구조.",
    date: "2026-09-12",
    category: "투자 프레임워크",
    tags: ["희석", "증자", "주식수"],
    access: "free",
    url: "",
    cover: "framework",
    readMinutes: 7,
    demo: true
  },
  {
    id: "valuation-rates",
    title: "금리는 왜 성장주 밸류에이션을 흔들까?",
    summary: "먼 미래에 발생할 현금흐름의 가치를 오늘의 숫자로 환산하는 기본 원리.",
    date: "2026-09-09",
    category: "거시경제",
    tags: ["금리", "DCF", "성장주"],
    access: "free",
    url: "",
    cover: "macro",
    readMinutes: 7,
    demo: true
  }
];
