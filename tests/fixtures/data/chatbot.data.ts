import type { ChatbotStats, ChatCacheItem, ChatLog } from '@/api/chatbotApi';

export type MockChatbotStatsVariant = 'default' | 'with_errors' | 'empty_intents';

export const mockChatbotSearchKeyword = 'Bà Nà';

export const mockChatbotStatsBase: ChatbotStats = {
  kpis: {
    total_messages: 1284,
    cache_hit_rate: 62.5,
    avg_latency: 340,
    total_cost: 0.0842,
    system_errors: 0,
  },
  trends: {
    latency: [
      { date: '01/06', latency: 320 },
      { date: '02/06', latency: 355 },
      { date: '03/06', latency: 310 },
    ],
    cacheRate: [
      { date: '01/06', hitRate: 58 },
      { date: '02/06', hitRate: 64 },
      { date: '03/06', hitRate: 66 },
    ],
    cost: [
      { date: '01/06', cost: 0.02, tokens: 1200 },
      { date: '02/06', cost: 0.03, tokens: 1800 },
    ],
    errors: [
      { date: '01/06', errors: 0 },
      { date: '02/06', errors: 1 },
      { date: '03/06', errors: 0 },
    ],
  },
  business: {
    topDestinations: [
      { name: 'Đà Nẵng', value: 42 },
      { name: 'Hội An', value: 28 },
    ],
    topTours: [
      { name: 'Tour Bà Nà Hills Premium Experience', value: 19 },
      { name: 'Tour Sơn Trà', value: 12 },
    ],
    intentDistribution: [
      { name: 'tour', value: 45 },
      { name: 'booking', value: 22 },
      { name: 'unknown', value: 8 },
    ],
    unknownIntents: [
      {
        id: 1,
        question: 'Có tour đi Lý Sơn không?',
        created_at: '2026-06-20T10:30:00Z',
      },
    ],
    negativeFeedbacks: [
      {
        id: 2,
        question: 'Giá tour Bà Nà bao nhiêu?',
        answer: 'Vui lòng xem trên website.',
        intent: 'tour',
        metadata: { rating: 'negative' },
        created_at: '2026-06-19T14:00:00Z',
      },
    ],
    clarification: {
      total_clarified_sessions: 50,
      completed_sessions: 38,
      completion_rate: 76,
      drop_off_rate: 24,
    },
  },
};

export const mockChatbotStatsWithErrors: ChatbotStats = {
  ...mockChatbotStatsBase,
  kpis: {
    ...mockChatbotStatsBase.kpis,
    system_errors: 3,
  },
};

export const mockChatbotStatsEmptyIntents: ChatbotStats = {
  ...mockChatbotStatsBase,
  business: {
    ...mockChatbotStatsBase.business,
    intentDistribution: [],
    unknownIntents: [],
    negativeFeedbacks: [],
  },
};

function buildLog(partial: Partial<ChatLog> & Pick<ChatLog, 'id' | 'question' | 'intent'>): ChatLog {
  return {
    session_id: `sess-${partial.id}`,
    answer: partial.answer ?? 'Đây là câu trả lời mẫu từ Copilot.',
    cache_hit: partial.cache_hit ?? false,
    tokens_used: partial.tokens_used ?? 120,
    created_at: partial.created_at ?? '2026-06-21T08:00:00Z',
    metadata: partial.metadata ?? { latency_ms: 280 },
    ...partial,
  };
}

export const mockChatbotDetailLog: ChatLog = buildLog({
  id: 101,
  question: 'Tour Bà Nà giá bao nhiêu?',
  intent: 'tour',
  cache_hit: true,
  metadata: {
    latency_ms: 95,
    rating: 'negative',
    session_slots: { destination: 'da-nang', budget: '2000000' },
    understanding: { confidence: 0.91, intent: 'tour' },
    warnings: ['Low confidence on price range'],
  },
});

export const mockChatbotLogRows: ChatLog[] = [
  mockChatbotDetailLog,
  buildLog({
    id: 102,
    question: 'Đặt tour Bà Nà ngày mai',
    intent: 'booking',
    cache_hit: false,
    metadata: { latency_ms: 410, rating: 'positive' },
  }),
  buildLog({
    id: 103,
    question: 'Không hiểu câu hỏi này',
    intent: 'unknown',
    cache_hit: false,
    metadata: { latency_ms: 520 },
  }),
  buildLog({
    id: 104,
    question: 'Chuyển cho nhân viên hỗ trợ',
    intent: 'handoff',
    cache_hit: false,
    metadata: { latency_ms: 180 },
  }),
  ...Array.from({ length: 16 }, (_, i) =>
    buildLog({
      id: 200 + i,
      question: `Câu hỏi mẫu số ${i + 1} về du lịch`,
      intent: i % 2 === 0 ? 'tour' : 'location',
      cache_hit: i % 3 === 0,
      created_at: `2026-06-${10 + (i % 10)}T09:00:00Z`,
      metadata: { latency_ms: 200 + i * 5 },
    })
  ),
];

export const mockChatbotCacheRows: ChatCacheItem[] = [
  {
    id: 1,
    question_hash: 'hash-tour-ba-na',
    normalized_question: 'gia tour ba na bao nhieu',
    locale: 'vi',
    intent: 'tour',
    provider: 'openai',
    model: 'gpt-4o-mini',
    expires_at: null,
    created_at: '2026-06-20T00:00:00Z',
  },
  {
    id: 2,
    question_hash: 'hash-booking-slot',
    normalized_question: 'dat tour hom nay',
    locale: 'vi',
    intent: 'booking',
    provider: 'openai',
    model: 'gpt-4o-mini',
    expires_at: null,
    created_at: '2026-06-19T00:00:00Z',
  },
  {
    id: 3,
    question_hash: 'hash-food-local',
    normalized_question: 'quan an ngon da nang',
    locale: 'vi',
    intent: 'food',
    provider: 'openai',
    model: 'gpt-4o-mini',
    expires_at: null,
    created_at: '2026-06-18T00:00:00Z',
  },
  {
    id: 4,
    question_hash: 'hash-deletable',
    normalized_question: 'cache entry to delete',
    locale: 'vi',
    intent: 'greeting',
    provider: 'openai',
    model: 'gpt-4o-mini',
    expires_at: null,
    created_at: '2026-06-17T00:00:00Z',
  },
];

export const LOGS_PER_PAGE = 15;
