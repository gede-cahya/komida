'use client';

import dynamic from 'next/dynamic';

const Web3ProviderCore = dynamic(
    () => import('./web3-provider-core').then((m) => m.Web3ProviderCore),
    { ssr: false }
);

export function Web3Provider({ children }: { children: React.ReactNode }) {
    return <Web3ProviderCore>{children}</Web3ProviderCore>;
}
