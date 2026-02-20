import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';
import { cookieStorage, createStorage } from 'wagmi';

export const wagmiConfig = getDefaultConfig({
    appName: 'Komida',
    projectId: 'YOUR_PROJECT_ID', // ReWalletConnect project ID (optional but recommended)
    chains: [base],
    ssr: true, // If your dApp uses server side rendering (SSR)
    storage: createStorage({
        storage: cookieStorage,
    }),
});
