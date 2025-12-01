import type { Metadata } from 'next';
import BlogPostClient from './BlogPostClient';

export const metadata: Metadata = {
    title: '5 Key Steps to Digital Transformation in Pharma Distribution',
    description: 'Discover the 5 essential steps to modernize your pharmaceutical distribution business. Learn how DMS, AI, and Omnichannel strategies drive growth.',
    openGraph: {
        title: '5 Key Steps to Digital Transformation in Pharma Distribution | AM Medtech',
        description: 'Discover the 5 essential steps to modernize your pharmaceutical distribution business. Learn how DMS, AI, and Omnichannel strategies drive growth.',
        url: 'https://ammedtech.com/blog/digital-transformation-pharma',
        siteName: 'AM Medtech',
        images: [
            {
                url: '/blog/digital-transformation.jpg',
                width: 1200,
                height: 630,
                alt: 'Digital Transformation in Pharma',
            },
        ],
        locale: 'en_US',
        type: 'article',
    },
    twitter: {
        card: 'summary_large_image',
        title: '5 Key Steps to Digital Transformation in Pharma Distribution',
        description: 'Discover the 5 essential steps to modernize your pharmaceutical distribution business.',
        images: ['/blog/digital-transformation.jpg'],
    },
};

export default function Page() {
    return <BlogPostClient />;
}
