import { redirect } from 'next/navigation';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// 예전 결제 완료 주소. 이제는 서버가 서명한 영수증(r)이 있어야 하는 /book/success 로 보낸다.
export default async function LegacyCheckoutSuccess({ searchParams }: Props) {
  const params = await searchParams;
  const r = typeof params.r === 'string' ? params.r : '';
  redirect(r ? `/book/success?r=${encodeURIComponent(r)}` : '/book/success');
}
