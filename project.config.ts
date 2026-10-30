import type { ProjectConfig } from './types/project';

/**
 * 기업별 프로젝트를 시작할 때 가장 먼저 수정하는 설정입니다.
 *
 * key는 아래 기업 전용 폴더명과 반드시 같아야 합니다.
 * - components/projects/{key}
 * - assets/scss/projects/{key}
 * - public/images/projects/{key}
 */
export const projectConfig = {
    key: 'onair',
    companyName: '대한항공 예매 연습',
    serviceName: 'KOREAN AIR PRACTICE',
    locale: 'ko',
    baseURL: '/flight-booking/',
    siteUrl: 'https://yheun03.github.io/flight-booking/',
    favicon: 'images/projects/onair/favicon.svg',
    themeColor: '#071d75',
    seo: {
        title: '대한항공 예매 연습',
        titleTemplate: '%s | KOREAN AIR PRACTICE',
        description: '대한항공 스타일의 가상 항공 예약부터 온라인 체크인까지 체험하는 포트폴리오.',
        keywords: ['대한항공', '항공 예약', '예매 연습', '포트폴리오'],
        ogImage: 'images/projects/onair/og-image.svg',
        ogImageAlt: 'Korean Air booking practice',
        twitterCard: 'summary_large_image',
    },
} satisfies ProjectConfig;
