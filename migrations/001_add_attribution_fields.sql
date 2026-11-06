-- 어트리뷰션 추적 필드 추가 마이그레이션
-- 운영 DB에 직접 적용하지 말 것 (관리자 승인 후 실행)
-- 
-- 이 마이그레이션은 admin.rideordie.kr의 공유 Supabase에서 실행됩니다.
-- 테이블명: payments (강습 예약 저장용)
--
-- 실행 전 확인:
-- 1. admin 저장소 PR #20이 배포되어 있는지 확인
-- 2. 백업 완료 확인
-- 3. 테스트 환경에서 먼저 실행하여 검증

-- =====================================================
-- Attribution 필드 추가
-- =====================================================

-- First-touch attribution (최초 유입 정보)
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS attr_first JSONB;

-- Last-touch attribution (최종 유입 정보)
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS attr_last JSONB;

-- Attribution model (어트리뷰션 모델: last_non_direct, first_touch, linear 등)
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS attr_model VARCHAR(50) DEFAULT 'last_non_direct';

-- =====================================================
-- 인덱스 추가 (성능 최적화)
-- =====================================================

-- attr_last의 특정 필드에 대한 인덱스 (네이버 키워드 ID 조회용)
CREATE INDEX IF NOT EXISTS idx_payments_attr_last_n_keyword_id 
ON payments ((attr_last->>'n_keyword_id')) 
WHERE attr_last IS NOT NULL;

-- attr_last의 소스 필드 인덱스 (채널별 조회용)
CREATE INDEX IF NOT EXISTS idx_payments_attr_last_source 
ON payments ((attr_last->>'source')) 
WHERE attr_last IS NOT NULL;

-- attr_last의 fbclid 필드 인덱스 (메타 광고 추적용)
CREATE INDEX IF NOT EXISTS idx_payments_attr_last_fbclid 
ON payments ((attr_last->>'fbclid')) 
WHERE attr_last IS NOT NULL;

-- =====================================================
-- 코멘트 추가
-- =====================================================

COMMENT ON COLUMN payments.attr_first IS '최초 유입 정보 (first-touch attribution): utm_*, n_*, fbclid, ttclid, gclid, referrer, landing_path, ts';
COMMENT ON COLUMN payments.attr_last IS '최종 유입 정보 (last-touch attribution): 결제 시점 기준 마지막 비-다이렉트 유입';
COMMENT ON COLUMN payments.attr_model IS '어트리뷰션 모델: last_non_direct(기본), first_touch, linear 등';

-- =====================================================
-- 조회 예시 쿼리 (참고용, 실행하지 않음)
-- =====================================================

-- 1. 네이버 키워드별 예약 수
-- SELECT 
--   attr_last->>'n_keyword' as keyword,
--   attr_last->>'n_keyword_id' as keyword_id,
--   COUNT(*) as reservation_count,
--   SUM(amount) as total_amount
-- FROM payments
-- WHERE attr_last->>'n_keyword_id' IS NOT NULL
--   AND payment_status = 'paid'
-- GROUP BY keyword, keyword_id
-- ORDER BY reservation_count DESC;

-- 2. 채널별 예약 수 및 매출
-- SELECT 
--   COALESCE(attr_last->>'source', 'direct') as source,
--   COUNT(*) as reservation_count,
--   SUM(amount) as total_amount,
--   AVG(amount) as avg_amount
-- FROM payments
-- WHERE payment_status = 'paid'
-- GROUP BY source
-- ORDER BY total_amount DESC;

-- 3. 메타 광고(fbclid) 전환 추적
-- SELECT 
--   DATE(created_at) as date,
--   COUNT(*) as conversions,
--   SUM(amount) as revenue
-- FROM payments
-- WHERE attr_last->>'fbclid' IS NOT NULL
--   AND payment_status = 'paid'
-- GROUP BY date
-- ORDER BY date DESC;

-- 4. First-touch vs Last-touch 비교
-- SELECT 
--   attr_first->>'source' as first_source,
--   attr_last->>'source' as last_source,
--   COUNT(*) as count
-- FROM payments
-- WHERE attr_first IS NOT NULL 
--   AND attr_last IS NOT NULL
--   AND payment_status = 'paid'
-- GROUP BY first_source, last_source
-- ORDER BY count DESC;
