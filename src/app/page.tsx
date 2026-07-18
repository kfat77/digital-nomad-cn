import { ArrowRight, Globe2, Landmark, Signal, TrendingUp } from 'lucide-react';
import { PlanetCoin } from '../components/PlanetCoin';

const paths = [
  { title: '银行卡', text: '让收入、消费与换汇有一条清晰的路径。', icon: Landmark, href: '#banking', color: 'mint' },
  { title: '电话卡', text: '抵达前后，始终保持可用、可控的连接。', icon: Signal, href: '#phone', color: 'blue' },
  { title: '证券账户', text: '理解账户边界，再做长期配置。', icon: TrendingUp, href: '#securities', color: 'sand' },
];

export default function Home() {
  return <main><div className="notice">为跨境生活设计的原创准备工具 <span>·</span> 从一件真正重要的事开始</div><header><a className="brand" href="#top"><b>N</b> nomad essentials</a><nav aria-label="主导航">{paths.map(({ title, href }) => <a key={href} href={href}>{title}</a>)}<a className="navCta" href="#paths">开始准备</a></nav></header><section id="top" className="hero"><p className="eyebrow"><Globe2 size={16} /> 跨境生活，从基础设施开始</p><h1>把世界变大，<br />把开始变简单。</h1><p className="lede">专注银行卡、电话卡和证券账户三件事。清晰了解选择边界，再前往服务商官网完成下一步。</p><div className="actions"><a className="primary" href="#paths">选择你的第一步 <ArrowRight size={18} /></a><a className="secondary" href="#principles">了解我们如何整理</a></div><PlanetCoin /></section><section id="paths" className="paths"><p className="eyebrow">选择一条路径</p><h2>只做你现在需要的那一件事。</h2><div className="cards">{paths.map(({ title, text, icon: Icon, href, color }) => <article className={`card ${color}`} id={href.slice(1)} key={title}><Icon aria-hidden="true" size={28} strokeWidth={1.7} /><span>0{paths.findIndex((item) => item.title === title) + 1}</span><h3>{title}</h3><p>{text}</p><a href="#principles">开始规划 <ArrowRight size={17} /></a></article>)}</div></section><section id="principles" className="principles"><p className="eyebrow">先看清规则</p><h2>不承诺万能答案，<br />只帮你问对问题。</h2><div><p><b>居住地与身份</b>决定你是否可申请。</p><p><b>真实使用场景</b>决定你需要哪类账户。</p><p><b>服务商官网</b>才是提交申请的唯一入口。</p></div></section><footer><a className="brand" href="#top"><b>N</b> nomad essentials</a><p>仅作信息整理，不构成开户、投资、法律或税务建议。</p></footer></main>;
}
