import { Suspense } from 'react';
import { RedTeamSimulator } from '@/components/simulation/RedTeamSimulator';

export default function RedTeamPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-[#A79B96]">Loading Attack Simulation Engine...</div>}>
      <RedTeamSimulator />
    </Suspense>
  );
}
