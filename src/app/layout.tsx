import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Nomad Essentials', description: '跨境生活的三项基础准备。' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
