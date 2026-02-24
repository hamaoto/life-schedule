import { redirect } from 'next/navigation';
import { encodeWeekPeriod } from '@/types/sheet';

export default function Home() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const weekOfMonth = Math.min(Math.ceil(now.getDate() / 7), 5);
  const weekPeriod = encodeWeekPeriod(month, weekOfMonth);

  redirect(`/sheet/week/${year}/${weekPeriod}`);
}
