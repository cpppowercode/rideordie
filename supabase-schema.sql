-- RideOrDie 결제 시스템 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- orders 테이블 생성
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(50) UNIQUE NOT NULL,
  payment_key VARCHAR(100),
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  lesson_date DATE,
  product_id VARCHAR(50) NOT NULL,
  product_name TEXT NOT NULL,
  selected_options JSONB,
  amount INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- payment_logs 테이블 생성 (결제 추적용)
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(50) REFERENCES orders(order_id),
  payment_key VARCHAR(100),
  method VARCHAR(50),
  approved_at TIMESTAMP,
  receipt_url TEXT,
  raw_response JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_logs_order_id ON payment_logs(order_id);

-- RLS (Row Level Security) 활성화
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- 정책 생성: 서비스 역할은 모든 작업 가능
CREATE POLICY "Service role can do everything on orders"
  ON orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can do everything on payment_logs"
  ON payment_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 정책 생성: 익명 사용자는 자신의 이메일로 조회만 가능 (선택사항)
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO anon
  USING (customer_email = current_setting('request.jwt.claims', true)::json->>'email');

-- ---------------------------------------------------------------------------
-- 강습 예약은 이 파일의 orders 테이블이 아니라,
-- admin.rideordie.kr 이 쓰는 공유 Supabase 테이블 `payments` 에 저장합니다.
-- (관리자 UI 경로: /lesson-reservations, 메뉴명 「강습예약」)
-- 운영 DB에는 이미 테이블이 있으므로 마이그레이션을 다시 실행하지 마세요.
--
-- 고객 사이트가 쓰는 컬럼:
--   customer_name, customer_phone, lesson_type, ski_resort, lesson_date,
--   lesson_start_hour, lesson_duration_hours, participants, insurance_count,
--   amount, payment_method, order_no, notes, instructor_id,
--   payment_status, reservation_status, tenant_id, created_at
-- ---------------------------------------------------------------------------
