export interface Question {
  id: number;
  text: string;
  factor: 'O' | 'C' | 'E' | 'A' | 'N';
  isReverse: boolean;
}

export const QUESTIONS: Question[] = [
  // Openness (O): 1~8. Reverse: 6, 7
  { id: 1, text: "새로운 아이디어를 생각하거나 기획하는 것을 즐긴다.", factor: 'O', isReverse: false },
  { id: 2, text: "예술이나 디자인, 자연의 아름다움에 쉽게 몰입한다.", factor: 'O', isReverse: false },
  { id: 3, text: "지적 호기심이 많고 새로운 분야를 배우는 것을 갈망한다.", factor: 'O', isReverse: false },
  { id: 4, text: "철학적이거나 추상적인 질문에 대해 토론하는 것을 좋아한다.", factor: 'O', isReverse: false },
  { id: 5, text: "다양한 시각이나 독창적인 상상을 하는 경우가 많다.", factor: 'O', isReverse: false },
  { id: 6, text: "익숙하고 검증된 방식 속에서 가장 편안함을 느낀다.", factor: 'O', isReverse: true },
  { id: 7, text: "복잡하고 이론적인 이야기보다는 단순하고 명확한 사실을 선호한다.", factor: 'O', isReverse: true },
  { id: 8, text: "상상력이 풍부하여 머릿속으로 여러 시나리오를 자유롭게 그려본다.", factor: 'O', isReverse: false },

  // Conscientiousness (C): 9~16. Reverse: 13, 14, 16
  { id: 9, text: "해야 할 일의 계획을 꼼꼼히 세우고 이를 실행한다.", factor: 'C', isReverse: false },
  { id: 10, text: "업무나 프로젝트를 시작하기 전에 준비물을 미리 철저히 챙긴다.", factor: 'C', isReverse: false },
  { id: 11, text: "작은 디테일이나 사소한 오류도 놓치지 않고 검토한다.", factor: 'C', isReverse: false },
  { id: 12, text: "약속이나 기한, 가이드라인을 철저히 지키려 노력한다.", factor: 'C', isReverse: false },
  { id: 13, text: "체계적인 계획을 따르기보다 즉흥적으로 결정하고 행동한다.", factor: 'C', isReverse: true },
  { id: 14, text: "도구와 환경이 정리정돈되어 있는 것보다 자유롭게 흩어져 있는 것이 편하다.", factor: 'C', isReverse: true },
  { id: 15, text: "한 번 맡은 일이나 역할은 어떠한 상황에서도 끝까지 책임지고 완수한다.", factor: 'C', isReverse: false },
  { id: 16, text: "어려운 과제가 주어지면 해결책을 찾기보다 뒤로 미루는 경향이 있다.", factor: 'C', isReverse: true },

  // Extraversion (E): 17~24. Reverse: 21, 22, 24
  { id: 17, text: "여러 사람과 어울려 소통할 때 활력과 에너지가 샘솟는다.", factor: 'E', isReverse: false },
  { id: 18, text: "모임이나 팀 내에서 대화를 주도적으로 이끌어가거나 활발히 발언한다.", factor: 'E', isReverse: false },
  { id: 19, text: "처음 만난 사람에게도 어색함 없이 먼저 말을 건네고 친해진다.", factor: 'E', isReverse: false },
  { id: 20, text: "내 기쁨이나 슬픔 등 감정을 말과 행동으로 외부에 활발히 표현한다.", factor: 'E', isReverse: false },
  { id: 21, text: "시끌벅적한 분위기보다는 조용히 나만의 시간을 갖는 것을 선호한다.", factor: 'E', isReverse: true },
  { id: 22, text: "스포트라이트를 받는 등 여러 사람 앞에 나서는 자리가 심적으로 부담스럽다.", factor: 'E', isReverse: true },
  { id: 23, text: "활동적이고 역동적인 팀 활동이나 이벤트를 좋아한다.", factor: 'E', isReverse: false },
  { id: 24, text: "대화에 참여하기 전에 머릿속으로 조용히 생각을 오래 정리하는 편이다.", factor: 'E', isReverse: true },

  // Agreeableness (A): 25~32. Reverse: 29, 30
  { id: 25, text: "동료의 어려움이나 감정에 적극적으로 공감하고 다정하게 위로한다.", factor: 'A', isReverse: false },
  { id: 26, text: "주변 사람들이 편안해할 수 있도록 나의 필요보다 그들의 입장을 배려한다.", factor: 'A', isReverse: false },
  { id: 27, text: "타인의 생각이나 의견이 나와 달라도 우선 경청하고 가치를 존중한다.", factor: 'A', isReverse: false },
  { id: 28, text: "갈등이나 대립이 발생하는 것보다는 평화롭게 화합하는 분위기를 중요시한다.", factor: 'A', isReverse: false },
  { id: 29, text: "모두 함께 협력하여 상생하는 것보다 공동체 내 경쟁에서 이기는 것이 짜릿하다.", factor: 'A', isReverse: true },
  { id: 30, text: "상대방의 개인적인 사정보다 논리적인 사실이나 객관적 원칙을 먼저 들이댄다.", factor: 'A', isReverse: true },
  { id: 31, text: "누군가를 도와주는 일에서 큰 보람과 깊은 행복감을 느낀다.", factor: 'A', isReverse: false },
  { id: 32, text: "기본적으로 타인의 선의를 쉽게 믿으며, 긍정적인 면을 먼저 본다.", factor: 'A', isReverse: false },

  // Neuroticism (N): 33~40. Reverse: 37, 38, 40
  { id: 33, text: "작은 일에도 생각이 꼬리를 물며 걱정과 불안이 엄습하는 편이다.", factor: 'N', isReverse: false },
  { id: 34, text: "하루 동안에도 감정이 자주 요동치며 기분의 변화가 큰 편이다.", factor: 'N', isReverse: false },
  { id: 35, text: "스트레스를 유발하는 복잡한 상황에 부딪히면 몸과 마음이 쉽게 예민해진다.", factor: 'N', isReverse: false },
  { id: 36, text: "누군가 지적이나 피드백을 하면 며칠 동안 마음에 담아두고 자책하곤 한다.", factor: 'N', isReverse: false },
  { id: 37, text: "어려고 힘든 사건이 생겨도 마음을 다잡고 평정심을 신속히 회복한다.", factor: 'N', isReverse: true },
  { id: 38, text: "평소 긴장하거나 불안해하기보다, 매사 긍정적이고 태평한 마음을 유지한다.", factor: 'N', isReverse: true },
  { id: 39, text: "상대방의 무심한 태도나 눈빛에 상처를 입거나 나를 미워하는지 고민한다.", factor: 'N', isReverse: false },
  { id: 40, text: "예상치 못한 위급한 비상 사태가 닥쳤을 때 냉정하고 침착하게 대응책을 찾는다.", factor: 'N', isReverse: true }
];

export interface CharacterProfile {
  key: string;
  name: string;
  emoji: string;
  scores: {
    O: number;
    C: number;
    E: number;
    A: number;
    N: number;
  };
  title: string;
  desc: string;
  strengths: string[];
  weaknesses: string[];
  chemistry: {
    best: string;
    worst: string;
  };
  roleTips: string;
}

export const CHARACTER_PROFILES: Record<string, CharacterProfile> = {
  navigator: {
    key: "navigator",
    name: "네비게이터",
    emoji: "🔭",
    scores: { O: 4.6, C: 4.4, E: 3.3, A: 2.8, N: 2.3 },
    title: "목표를 향해 방향을 비추는 나침반",
    desc: "크리에이티브와 실행력이 매우 높아 장기적인 전략과 목표를 수립하는 데 뛰어납니다. 다소 차분한 톤으로 비전을 명확히 제시하며 팀을 올바른 길로 안내합니다.",
    strengths: ["체계적인 비전 수립", "논리적인 전략 기획", "안정적인 목표 설정"],
    weaknesses: ["지나치게 계획에 집착", "융통성 없는 일 처리 우려"],
    chemistry: { best: "energizer", worst: "observer" },
    roleTips: "주장(Leader) 역할을 맡았을 때 최고의 시너지를 발휘하며, 팀의 단기/장기 행동 로드맵을 꼼꼼하게 정리해 줍니다."
  },
  peacemaker: {
    key: "peacemaker",
    name: "피스메이커",
    emoji: "💗",
    scores: { O: 3.0, C: 3.2, E: 2.7, A: 4.6, N: 4.7 },
    title: "팀의 조화를 수호하는 따뜻한 방패",
    desc: "팀워크가 매우 높고 감정이 조화롭습니다. 갈등 상황을 누구보다 빠르게 중재하며 팀 분위기를 훈훈하고 편안하게 이끌어줍니다.",
    strengths: ["탁월한 경청과 공감", "갈등 상황 중재력", "적극적인 상호존중"],
    weaknesses: ["직설적인 거절을 어려워함", "타인을 위해 본인 주장을 굽힘"],
    chemistry: { best: "detail_master", worst: "pioneer" },
    roleTips: "기록요정(Recorder)이나 오늘의주장(Leader) 역할을 겸임할 때 동료들의 합의를 잘 이끌어내고 조율할 수 있습니다."
  },
  idea_bank: {
    key: "idea_bank",
    name: "아이디어뱅크",
    emoji: "💡",
    scores: { O: 4.8, C: 2.2, E: 4.0, A: 3.2, N: 4.0 },
    title: "창의적인 해결책이 마르지 않는 샘물",
    desc: "최고 수준의 크리에이티브와 활발한 추진력을 가졌습니다. 새로운 트렌드를 제시하고, 아이스브레이킹과 브레인스토밍에서 거침없이 획기적인 아이디어를 투척합니다.",
    strengths: ["풍부한 크리에이티브", "자유롭고 넓은 생각", "활발한 커뮤니케이션"],
    weaknesses: ["뒷마무리가 다소 흐지부지함", "마감 시간 관리에 소홀함"],
    chemistry: { best: "detail_master", worst: "observer" },
    roleTips: "마이크요정(Mic)을 맡아 아이디어 피칭을 활기차게 주도하거나 토론의 말문을 트는 분위기 메이커로 활약하기 좋습니다."
  },
  observer: {
    key: "observer",
    name: "관찰자",
    emoji: "🔍",
    scores: { O: 3.6, C: 4.2, E: 1.9, A: 3.0, N: 3.0 },
    title: "침착하게 진실을 포착하는 조용한 렌즈",
    desc: "조용하지만 실행력과 분석적인 태도를 갖추고 있습니다. 회의 중간에 상황을 짚어내고 남들이 보지 못하는 맹점을 잡아내는 매서운 통찰력이 있습니다.",
    strengths: ["리스크 사전 탐색", "뛰어난 경청력", "합리적 비판 능력"],
    weaknesses: ["의견 표현 소극적", "지나치게 신중하여 전진 차단"],
    chemistry: { best: "pioneer", worst: "idea_bank" },
    roleTips: "길잃음방지위원(Guard)으로서 다른 사람들이 휩쓸리는 분위기일 때 제동을 걸어주거나 핵심 사항을 묵묵히 짚어주기에 최적입니다."
  },
  detail_master: {
    key: "detail_master",
    name: "디테일마스터",
    emoji: "✅",
    scores: { O: 2.4, C: 4.8, E: 2.3, A: 2.9, N: 2.2 },
    title: "마지막 온점 하나까지 놓치지 않는 현미경",
    desc: "실행력이 극대화되어 있고 꼼꼼함이 무기입니다. 문서 오타 검수나 스프레드시트 관리, 최종 결과물 퀄리티를 체크하는 최종 수문장 역할을 도맡습니다.",
    strengths: ["완벽에 가까운 마감 퀄리티", "약속 및 가이드라인 준수", "데이터 정확성 유지"],
    weaknesses: ["지나치게 사소한 부분 연연", "시간 압박에 취약할 우려"],
    chemistry: { best: "idea_bank", worst: "firefighter" },
    roleTips: "아이템관리자(Item)나 살림꾼(Housekeeper) 역할을 부여받으면 규칙과 정리 정돈을 보장하는 최상의 결과물을 빚어냅니다."
  },
  solver: {
    key: "solver",
    name: "해결사",
    emoji: "🧩",
    scores: { O: 4.4, C: 4.3, E: 3.0, A: 2.3, N: 1.9 },
    title: "어떤 꼬인 매듭도 풀어내는 마스터 키",
    desc: "높은 크리에이티브와 논리적 실행력이 결합되었습니다. 복잡하고 난해한 팀 프로젝트 미션이나 논리 게임에서 막힘없이 정답과 최적의 대안을 설계해 냅니다.",
    strengths: ["탁월한 문제 해결력", "효율적 프로세스 구성", "논리적 팩트 기반 판단"],
    weaknesses: ["감정적인 소통에 다소 무심함", "효율성 위주 독주 우려"],
    chemistry: { best: "network_builder", worst: "peacemaker" },
    roleTips: "길잃음방지위원(Guard)으로서 토론이 엉뚱한 삼천포로 빠지지 않도록 구조적이고 논리적인 중심축을 튼튼히 잡아줍니다."
  },
  firefighter: {
    key: "firefighter",
    name: "소방수",
    emoji: "🚒",
    scores: { O: 3.0, C: 4.2, E: 4.5, A: 3.5, N: 2.0 },
    title: "위기 속에서 침착하게 불을 끄는 소방관",
    desc: "스트레스 상황에서도 에너지를 잃지 않는 강한 멘탈과 순발력을 자랑합니다. 마감 직전 비상 사태가 생기거나, 계획이 무산되었을 때 몸을 던져 빠르게 수습하는 현장 요원입니다.",
    strengths: ["즉각적인 현장 수습력", "위기 앞에서의 민첩한 행동력", "높은 열정과 돌파력"],
    weaknesses: ["사전 계획을 다소 지루해함", "체계적 분석보다 몸이 먼저 나감"],
    chemistry: { best: "pro_planner", worst: "detail_master" },
    roleTips: "타임키퍼(Timer) 혹은 살림꾼(Housekeeper)으로서 시시각각 줄어드는 시간 압박을 즐기며 상황을 유연하게 수습하는 데 재능이 있습니다."
  },
  pioneer: {
    key: "pioneer",
    name: "개척자",
    emoji: "🚩",
    scores: { O: 4.4, C: 3.0, E: 4.8, A: 2.5, N: 1.9 },
    title: "미지의 길을 향해 먼저 달려 나가는 선구자",
    desc: "추진력과 크리에이티브가 매우 높아 두려움 없이 과감하게 추진하는 능력이 돋보입니다. 팀원들이 망설이고 있을 때 강력한 열정으로 돌파구를 뚫는 리더십을 갖추고 있습니다.",
    strengths: ["탁월한 실행력과 추진력", "변화와 리스크 감수", "팀원 동기 부여력"],
    weaknesses: ["속도 중심이라 구멍이 생김", "세세한 합의 과정을 생략하기 쉬움"],
    chemistry: { best: "observer", worst: "peacemaker" },
    roleTips: "오늘의주장(Leader)으로서 조원들을 힘차게 이끌고 깃발을 꽂으며 미션을 시원시원하게 밀어붙이는 리더 타입입니다."
  },
  early_adopter: {
    key: "early_adopter",
    name: "얼리어답터",
    emoji: "🥽",
    scores: { O: 4.7, C: 3.4, E: 4.3, A: 4.0, N: 2.8 },
    title: "새로운 기술과 도구를 제일 먼저 쥐는 손",
    desc: "상상력이 넓고 신기술에 친숙합니다. 피그마, 노션, AI 툴 등 새로운 협업 도구를 팀 활동에 잽싸게 도입하여 팀원들에게 사용법을 전파하는 유익한 혁신가입니다.",
    strengths: ["도구 및 정보 활용 능력", "신속한 적응력", "트렌디한 연출 및 작업"],
    weaknesses: ["쉽게 흥미를 잃음", "기본적인 원칙 수행에 다소 건성"],
    chemistry: { best: "detail_master", worst: "navigator" },
    roleTips: "아이템관리자(Item) 혹은 살림꾼(Housekeeper)으로서 팀의 작업물을 가장 트렌디하고 세련된 형태로 세팅 및 관리해 줍니다."
  },
  pro_planner: {
    key: "pro_planner",
    name: "프로플래너",
    emoji: "📅",
    scores: { O: 2.6, C: 4.7, E: 3.0, A: 4.0, N: 2.5 },
    title: "물 흐르듯 매끄러운 일정을 설계하는 설계사",
    desc: "실행력이 높고 팀워크가 어우러져 매끄러운 일정 계획을 세우는 데 일가견이 있습니다. 타인에게 강압적이지 않으면서도 온화하게 목표를 확인하고 관리하는 힘이 있습니다.",
    strengths: ["빈틈없는 타임라인 조율", "온화하지만 끈기 있는 관리", "체계적 할 일 분배"],
    weaknesses: ["극도로 돌발 상황에 직면하면 스트레스", "안정된 일정 밖의 과감한 베팅 부재"],
    chemistry: { best: "firefighter", worst: "idea_bank" },
    roleTips: "타임키퍼(Timer)를 담당했을 때 팀원들의 발언 시간 분배와 잔여 시간 조율을 자로 잰 듯 완벽하게 가이드해 줍니다."
  },
  energizer: {
    key: "energizer",
    name: "에너자이저",
    emoji: "🎉",
    scores: { O: 3.0, C: 2.3, E: 4.9, A: 4.5, N: 3.3 },
    title: "지친 팀원들에게 붉은 포션을 뿌리는 비타민",
    desc: "최상급 추진력과 매우 높은 팀워크를 가졌습니다. 어떤 무겁고 침침한 분위기의 조라도 단숨에 웃음이 빵빵 터지도록 만드는 리액션의 대가이자 분위기 메이커입니다.",
    strengths: ["긍정적인 팀 활력 공급", "최강의 리액션 and 분위기 주도", "높은 친화력"],
    weaknesses: ["목소리가 너무 커서 산만해짐", "진지하고 무거운 논의 집중 약화"],
    chemistry: { best: "navigator", worst: "observer" },
    roleTips: "마이크요정(Mic)을 맡아 발표, 스피치, 혹은 팀 리액션 피칭을 전담하면 조의 주목도를 극대화할 수 있습니다."
  },
  network_builder: {
    key: "network_builder",
    name: "네트워크빌더",
    emoji: "📞",
    scores: { O: 3.4, C: 2.6, E: 4.3, A: 4.7, N: 4.2 },
    title: "팀원들의 관계를 연결하는 보이지 않는 실",
    desc: "추진력과 팀워크가 모두 뛰어나며 사람 사이의 연결 고리를 중요시합니다. 각 사람의 목소리를 골고루 이끌어내고, 소외되는 조원이 한 명도 없도록 가교 역할을 톡톡히 해냅니다.",
    strengths: ["원활한 소통 유도", "조원 전원 참여 독려", "유연하고 따뜻한 유대 형성"],
    weaknesses: ["모두의 비위를 맞추다 결정 지연", "비즈니스 대화보다 사담 비율 상승"],
    chemistry: { best: "solver", worst: "navigator" },
    roleTips: "기록요정(Recorder)으로서 팀원들의 목소리를 고루 녹여내고, 화합하는 토의록과 피드백을 이끌어내기에 최적입니다."
  }
};

export interface RoleProfile {
  key: string;
  name: string;
  emoji: string;
  candidates: string[];
  desc: string;
  responsibilities: string[];
}

export const ROLES: Record<string, RoleProfile> = {
  mic: {
    key: "mic",
    name: "마이크요정",
    emoji: "🎤",
    candidates: ["energizer", "idea_bank"],
    desc: "팀의 활기찬 목소리! 발표와 네트워킹을 전담하며 우리 팀의 멋진 점을 외부에 활기차게 자랑합니다.",
    responsibilities: ["팀 미션 결과 발표", "의견 브레인스토밍 리드", "활기찬 리액션 공급"]
  },
  leader: {
    key: "leader",
    name: "오늘의주장",
    emoji: "👑",
    candidates: ["navigator", "pioneer"],
    desc: "팀의 영리한 나침반! 미션의 중심 방향을 잡고 팀원들의 화합과 최종 결정을 리드합니다.",
    responsibilities: ["회의 안건 정리 및 진행", "핵심 사안 의사결정", "역할 분담 조율"]
  },
  guard: {
    key: "guard",
    name: "길잃음방지위원",
    emoji: "🛡️",
    candidates: ["solver", "observer"],
    desc: "탈선 방지 파수꾼! 토론이 다른 길로 새지 않도록 미션 문항을 수시로 짚어주며 문제 해결을 보좌합니다.",
    responsibilities: ["미션 질문과 가이드 검토", "논리 오류와 리스크 차단", "회의 목적 환기"]
  },
  timer: {
    key: "timer",
    name: "타임키퍼",
    emoji: "⏱️",
    candidates: ["pro_planner", "firefighter"],
    desc: "시간의 수호신! 타임라인에 맞추어 팀 활동 속도를 완급 조절하고 제한 시간을 절대 사수합니다.",
    responsibilities: ["회의 단계별 제한 시간 확인", "지연 안건 정리 촉구", "최종 마감 시한 준수"]
  },
  item: {
    key: "item",
    name: "아이템관리자",
    emoji: "🎒",
    candidates: ["detail_master", "early_adopter"],
    desc: "도구와 연출의 마술사! 협업 툴(피그마, 캔버스 등) 세팅을 보장하고 최종 자료의 정리정돈을 맡습니다.",
    responsibilities: ["디지털 도구/작업 캔버스 세팅", "자료 오타 및 양식 최종 검수", "팀 보드 꾸미기"]
  },
  recorder: {
    key: "recorder",
    name: "기록요정",
    emoji: "✍️",
    candidates: ["peacemaker", "network_builder"],
    desc: "팀의 기억 보관소! 동료들이 나눈 소중한 아이디어를 조목조목 정리하여 회의록과 시각 자료로 남깁니다.",
    responsibilities: ["회의 핵심 내용 타이핑", "합의된 사항 정리 및 보관", "팀원 참여 현황 모니터링"]
  },
  housekeeper: {
    key: "housekeeper",
    name: "살림꾼",
    emoji: "🧹",
    candidates: ["pro_planner", "firefighter", "detail_master", "early_adopter"],
    desc: "시간 준수와 도구 관리를 하나로! 꼼꼼한 마감 체크와 타임라인 엄수까지 책임지는 든든한 뒤받침 담당입니다.",
    responsibilities: ["미션 진행 시간 모니터링", "작업 도구 세팅 및 내용 최종 검수", "회의 자료 취합 및 오타 교정"]
  }
};

export const STAT_METADATA = {
  O: { name: "창의성 💡", description: "아이디어·새로운 시도" },
  C: { name: "실행력 ⚙️", description: "꼼꼼함·책임감·완수" },
  E: { name: "추진력 🔥", description: "에너지·주도성·발언" },
  A: { name: "팀워크 🤝", description: "배려·협력·조화" },
  N: { name: "감수성 🌊", description: "타인의 감정과 분위기를 읽는 공감·섬세함" }
};

export const ADMIN_PASSWORD = '0067';

export interface Big5FactorDesc {
  title: string;
  keyName: string;
  coreDesc: string;
  highDesc: string;
  lowDesc: string;
  avgValue: number;
}

export const BIG5_REPORT_TEXTS = {
  introTitle: "BIG5 성격검사 결과 보고서 📊",
  introDescription: "이 보고서는 성격 심리학계에서 가장 오랜 연구와 높은 신뢰도를 자랑하는 'BIG5(빅파이브) 모델'에 기초하고 있습니다. 심리학자들이 수십 년간 인간 성격을 묘사하는 형용사 데이터를 수집하여 통계 분석한 결과, 모든 성향은 최종 5가지 핵심 기둥으로 묶인다는 사실을 발견했습니다. 성격에는 우열이 없으며 모든 스탯은 중립적입니다. 각 특성마다 특별한 장점과 취약점이 공존하므로, 나를 있는 그대로 이해하여 강점은 부각시키고 한계는 전략적으로 보완하는 지혜가 필요합니다.",
  factors: {
    O: {
      title: "개방성 💡",
      keyName: "개방성",
      coreDesc: "호기심, 예술적 소양, 다양성 및 새로운 생각에 대한 감수성이 핵심입니다.",
      highDesc: "새로운 지식과 색다른 시도에 강한 호기심을 느끼며 독창적이고 도전적입니다. 상상력이 풍부하여 독창적인 돌파구를 잘 찾아냅니다.",
      lowDesc: "익숙하고 검증된 전통적인 방법을 선호합니다. 현실적이며 안정감 있는 일 처리를 중시합니다.",
      avgValue: 60
    },
    C: {
      title: "성실성 ⚙️",
      keyName: "성실성",
      coreDesc: "자기통제력, 계획성, 목표 달성을 향한 책임감과 몰입의 척도입니다.",
      highDesc: "목표를 위해 자신을 통제하며 계획적으로 차근차근 나아갑니다. 일의 디테일을 놓치지 않고 끝까지 완수하는 책임감이 강합니다.",
      lowDesc: "상황에 따라 즉흥적이고 유연하게 대처하는 편입니다. 정형화된 틀보다는 자유로움 속에서 편안함을 느낍니다.",
      avgValue: 60
    },
    E: {
      title: "외향성 🔥",
      keyName: "외향성",
      coreDesc: "자극과 관계를 추구하는 활력, 주도성 및 리더십의 원천입니다.",
      highDesc: "타인과의 협업 및 시끌벅적한 자극 속에서 엄청난 추진력과 에너지를 얻습니다. 주도적으로 대화를 이끌고 활동적입니다.",
      lowDesc: "생각을 신중하게 조용히 정리한 후 행동합니다. 내면의 소리에 집중하며, 사소하고 진정성 있는 좁은 관계를 선호합니다.",
      avgValue: 50
    },
    A: {
      title: "우호성 🤝",
      keyName: "우호성",
      coreDesc: "타인에 대한 이타심, 조화로운 협조 및 따뜻한 공감 능력의 지표입니다.",
      highDesc: "다정하고 타인을 배려하며 팀의 화합을 1순위로 여깁니다. 협력을 통해 동료와 깊은 공감대를 형성합니다.",
      lowDesc: "경쟁이나 객관적인 원칙에 입각한 분석을 선호합니다. 독립적이며 타인의 사정보다 논리적 선결 조건에 집중합니다.",
      avgValue: 56
    },
    N: {
      title: "신경성 🌊",
      keyName: "신경성",
      coreDesc: "스트레스와 비상 사태에 대처하는 위험 감수성 및 섬세한 정서 반응력입니다.",
      highDesc: "주변 환경과 타인의 정서를 매우 섬세하게 읽어내며, 위험 요소를 기민하게 감지하고 대비하는 신중함을 보여줍니다.",
      lowDesc: "스트레스 요인에 덤덤하고 태연하게 대처합니다. 웬만한 긴장 유발 상황에서도 평정심을 유지하는 단단함이 강점입니다.",
      avgValue: 51
    }
  } as Record<'O' | 'C' | 'E' | 'A' | 'N', Big5FactorDesc>
};
