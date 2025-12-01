import type { Metadata } from 'next';
import BlogPostClient from './BlogPostClient';

export const metadata: Metadata = {
    title: 'How AI is Revolutionizing Pharmaceutical Supply Chains',
    description: 'Learn how Artificial Intelligence is transforming pharma logistics, from predictive demand forecasting to automated quality control.',
    openGraph: {
        title: 'How AI is Revolutionizing Pharmaceutical Supply Chains | AM Medtech',
        description: 'Learn how Artificial Intelligence is transforming pharma logistics, from predictive demand forecasting to automated quality control.',
        url: 'https://ammedtech.com/blog/ai-in-supply-chain',
        siteName: 'AM Medtech',
        images: [
            {
                url: '/blog/ai-supply-chain.jpg',
                width: 1200,
                height: 630,
                alt: 'AI in Pharma Supply Chain',
            },
        ],
        locale: 'en_US',
        type: 'article',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'How AI is Revolutionizing Pharmaceutical Supply Chains',
        description: 'Learn how Artificial Intelligence is transforming pharma logistics.',
        images: ['/blog/ai-supply-chain.jpg'],
    },
};

export default function Page() {
    return <BlogPostClient />;
}
