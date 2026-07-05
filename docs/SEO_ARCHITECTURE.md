# Global Mobility Infrastructure — SEO Architecture v3.0
## AI-Native Search Optimization

> **Target Engines**: Google · Bing · Perplexity · ChatGPT Search · Gemini · Claude · AI Search (universal)
> **Scale**: 502 pages deployed · 100,000+ pages programmatically scalable
> **Last Updated**: 2026-07-06

---

## 1. 关键词矩阵 (Keyword Matrix)

### 1.1 核心关键词层级

```
Tier 1: 品牌/使命 (低搜索量，高转化)
├── "global mobility infrastructure"
├── "中国护照全球生活"
├── "digital nomad china"
└── "global mobility platform"

Tier 2: 大词/品类 (高搜索量，高竞争)
├── "数字游民" (14,800/月)
├── "远程工作" (22,100/月)
├── "签证申请" (8,100/月)
├── "生活成本" (5,400/月)
├── "移民国家" (3,600/月)
└── "护照免签" (2,900/月)

Tier 3: 信息型长尾 (中搜索量，中竞争)
├── "日本旅游签证材料清单" (480/月)
├── "葡萄牙数字游民签证申请" (390/月)
├── "泰国生活成本一个月多少钱" (320/月)
├── "中国护照免签国家2026" (1,600/月)
├── "远程工作哪里找" (720/月)
├── "日本数字游民城市推荐" (210/月)
└── "爱沙尼亚数字游民签证" (260/月)

Tier 4: 交易型长尾 (低搜索量，高转化)
├── "日本签证费用2026" (170/月)
├── "葡萄牙D7签证银行存款要求" (140/月)
├── "泰国精英签证费用对比" (90/月)
├── "日本共享办公空间价格" (80/月)
├── "东京租房一个月多少钱" (110/月)
└── "远程工作薪资对比" (130/月)

Tier 5: 问题型/AI查询 (AI搜索核心)
├── "日本签证好办吗"
├── "中国护照去泰国需要签证吗"
├── "数字游民在日本怎么交税"
├── "东京和大阪哪个更适合远程工作"
├── "葡萄牙和西班牙哪个生活成本低"
├── "中国护照免签欧洲国家有哪些"
├── "日本签证被拒签常见原因"
└── "日本医疗和中国对比"
```

### 1.2 关键词分配策略

| 页面类型 | 主要关键词 | 次要关键词 | 长尾关键词 |
|----------|-----------|-----------|-----------|
| **首页** | 数字游民, 全球流动 | 远程工作, 签证指南 | 中国护照全球生活 |
| **国家页** | {国家}数字游民 | {国家}签证, {国家}生活成本 | {国家}适合远程工作吗 |
| **城市页** | {城市}数字游民 | {城市}生活成本, {城市}共享办公 | {城市}租房多少钱 |
| **签证页** | {国家}{签证类型}申请 | {国家}签证材料, {国家}签证流程 | {国家}签证费用2026 |
| **工具页** | 签证评估器, 生活成本计算器 | 薪资对比, 税务优化 | 日本生活成本计算器 |
| **文章页** | {主题}完整指南 | {主题}攻略, {主题}2026 | {主题}常见问题 |
| **数据库页** | 国家数据, 签证数据 | 开放数据, 免费数据 | 全球国家数据集下载 |

### 1.3 关键词密度与 placement

```html
<!-- H1: 精确匹配主关键词 -->
<h1>日本数字游民签证：申请条件、材料清单、流程费用完整指南</h1>

<!-- H2: 包含相关变体 -->
<h2>日本数字游民签证申请条件</h2>
<h2>日本签证所需材料清单</h2>
<h2>日本签证申请流程详解</h2>

<!-- Meta Description: 包含核心关键词 + CTA -->
<meta name="description" content="2026日本数字游民签证完整申请攻略：资格条件、材料清单、申请流程、费用、时间线。基于真实案例和最新政策。立即评估资格！">

<!-- URL: 包含关键词 -->
https://example.com/visa/japan-digital-nomad-visa-guide

<!-- 首段前100字: 必须包含主关键词 -->
<p>日本数字游民签证是...（前100字包含"日本数字游民签证"）</p>

<!-- 图片 Alt: 包含关键词 -->
<img alt="日本数字游民签证申请流程图" src="...">

<!-- 内部链接锚文本: 多样化关键词 -->
<a href="/country/japan">日本生活成本</a>
<a href="/visa/japan-tourist">日本旅游签证</a>
```

---

## 2. Topic Cluster 架构 (主题集群)

### 2.1 核心支柱页面 (Pillar Pages)

```
Pillar 1: 日本数字游民指南
├── /country/japan                    (支柱页)
│   ├── /visa/japan-tourist          (集群页)
│   ├── /visa/japan-work             (集群页)
│   ├── /visa/japan-digital-nomad    (集群页)
│   ├── /city/tokyo                  (集群页)
│   ├── /city/osaka                  (集群页)
│   ├── /cost/japan                  (集群页)
│   ├── /tax/japan                   (集群页)
│   ├── /internet/japan              (集群页)
│   ├── /healthcare/japan            (集群页)
│   └── /article/japan-nomad-guide   (集群页)

Pillar 2: 中国护照免签指南
├── /passport/china                  (支柱页)
│   ├── /country/visa-free-for-china (集群页)
│   ├── /visa/thailand-visa-free     (集群页)
│   ├── /visa/singapore-visa-free    (集群页)
│   ├── /visa/maldives-visa-free     (集群页)
│   └── /article/china-passport-visa-free-guide (集群页)

Pillar 3: 远程工作完全指南
├── /remote-jobs                     (支柱页)
│   ├── /article/remote-job-platforms (集群页)
│   ├── /article/remote-salary-negotiation (集群页)
│   ├── /article/remote-work-tools    (集群页)
│   ├── /tools/remote-job-matcher     (集群页)
│   └── /country/remote-work-friendly (集群页)

Pillar 4: 签证评估与申请
├── /tools/visa-eligibility           (支柱页)
│   ├── /visa/japan-tourist           (集群页)
│   ├── /visa/portugal-d7             (集群页)
│   ├── /visa/estonia-digital-nomad   (集群页)
│   ├── /visa/thailand-visa-free      (集群页)
│   └── /article/visa-application-tips (集群页)

Pillar 5: 全球生活成本对比
├── /tools/cost-of-living-calculator  (支柱页)
│   ├── /cost/japan                   (集群页)
│   ├── /cost/thailand                (集群页)
│   ├── /cost/portugal                (集群页)
│   ├── /cost/mexico                  (集群页)
│   └── /article/digital-nomad-budget  (集群页)
```

### 2.2 集群内部链接规则

```html
<!-- 支柱页 → 集群页 (至少10个内部链接) -->
<!-- 在日本国家页中 -->
<a href="/visa/japan-tourist">日本旅游签证</a> → 详细签证攻略
<a href="/city/tokyo">东京</a> → 城市数据
<a href="/cost/japan">日本生活成本</a> → 消费数据
<a href="/tax/japan">日本税务</a> → 税务信息
<a href="/internet/japan">日本网络</a> → 网络环境

<!-- 集群页 → 支柱页 (每个集群页必须链接回支柱页) -->
<!-- 在日本旅游签证页中 -->
<a href="/country/japan">← 日本完整指南</a>

<!-- 集群页 ↔ 集群页 (横向链接) -->
<!-- 在日本旅游签证页中 -->
<a href="/visa/japan-work">日本工作签证</a> → 对比
<a href="/visa/japan-student">日本学生签证</a> → 对比

<!-- 面包屑导航 (结构化内部链接) -->
<nav aria-label="breadcrumb">
  <ol>
    <li><a href="/">首页</a></li>
    <li><a href="/visa">签证</a></li>
    <li><a href="/country/japan">日本</a></li>
    <li>日本旅游签证</li>
  </ol>
</nav>
```

### 2.3 内容深度标准

| 页面类型 | 最低字数 | 推荐字数 | 图片数 | 表格数 | 视频 |
|----------|---------|---------|--------|--------|------|
| 支柱页 | 5,000 | 8,000+ | 5+ | 3+ | 可选 |
| 集群页 | 2,000 | 3,500+ | 3+ | 1+ | 可选 |
| 工具页 | 500 | 1,000+ | 2+ | 1+ | 教程视频 |
| 文章页 | 3,000 | 5,000+ | 4+ | 2+ | 推荐 |
| 数据库页 | 300 | 500+ | 1+ | 1+ | 无 |

---

## 3. 内部链接系统 (Internal Linking System)

### 3.1 自动化内部链接规则

```javascript
// 内部链接自动化规则
const INTERNAL_LINK_RULES = {
  // 规则1: 国家页自动链接到相关签证页
  countryPage: {
    pattern: ' mention visa ',
    linkTo: '/visa/{country}-*',
    maxLinks: 5,
    anchorText: ['{country}签证', '去{country}签证', '{country}旅游签证']
  },
  
  // 规则2: 签证页自动链接到国家页
  visaPage: {
    pattern: 'first mention of country name',
    linkTo: '/country/{country-id}',
    anchorText: ['{country}', '去{country}', '{country}指南']
  },
  
  // 规则3: 城市页自动链接到国家页和成本页
  cityPage: {
    links: [
      { to: '/country/{country}', anchor: ['{country}', '关于{country}'] },
      { to: '/cost/{country}', anchor: ['{country}生活成本', '在{country}花费'] }
    ]
  },
  
  // 规则4: 文章页自动链接到数据页
  articlePage: {
    // 检测到国家名时自动链接
    entityMention: {
      countries: { linkTo: '/country/{id}', priority: 1 },
      cities: { linkTo: '/city/{id}', priority: 2 },
      visas: { linkTo: '/visa/{id}', priority: 3 }
    }
  },
  
  // 规则5: 相关文章推荐
  relatedContent: {
    // 基于标签和分类的自动推荐
    algorithm: 'tf-idf + tag overlap',
    maxRecommendations: 5
  }
};
```

### 3.2 链接分布策略

```html
<!-- 每个页面的内部链接配额 -->
<!-- 首页: 50+ 内部链接 -->
<!-- 国家页: 30+ 内部链接 -->
<!-- 城市页: 20+ 内部链接 -->
<!-- 签证页: 15+ 内部链接 -->
<!-- 文章页: 10+ 内部链接 -->
<!-- 工具页: 8+ 内部链接 -->

<!-- 链接位置分布 -->
<!-- 30% 在正文段落中 -->
<!-- 25% 在侧边栏相关链接 -->
<!-- 20% 在面包屑导航 -->
<!-- 15% 在页脚快速链接 -->
<!-- 10% 在"你可能还想看"推荐区 -->
```

### 3.3 锚文本多样化

| 目标页面 | 锚文本变体 |
|----------|-----------|
| /country/japan | 日本, 日本指南, 去日本, 日本国家页, 关于日本 |
| /visa/japan-tourist | 日本旅游签证, 日本签证, 去日本签证, 日本签证申请 |
| /city/tokyo | 东京, 东京生活, 东京指南, 东京数字游民 |
| /tools/cost-calculator | 生活成本计算器, 计算生活成本, 估算月开销 |

---

## 4. Schema.org 结构化数据 (完整实现)

### 4.1 全局 Schema 注入

```html
<!-- 每个页面底部注入 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Global Mobility Infrastructure",
      "url": "https://example.com",
      "logo": "https://example.com/assets/logo.png",
      "sameAs": [
        "https://github.com/kfat77/digital-nomad-cn",
        "https://twitter.com/GlobalMobilityIO",
        "https://t.me/globalmobility_cn"
      ],
      "description": "数字化全球流动基础设施，为中国人提供全球国家、签证、城市、远程工作等数据"
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "url": "https://example.com",
      "name": "Global Mobility Infrastructure",
      "publisher": {"@id": "https://example.com/#organization"},
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://example.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
}
</script>
```

### 4.2 首页 Schema

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Global Mobility Infrastructure",
  "url": "https://example.com",
  "description": "中国护照全球生活数据平台 — 195个国家、1200+签证、50000+远程职位",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://example.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "about": {
    "@type": "Thing",
    "name": "Global Mobility",
    "description": "Digital nomad and global mobility information for Chinese passport holders"
  }
}
</script>

<!-- FAQPage Schema for homepage FAQ section -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "中国护照去日本需要签证吗？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "是的，中国护照持有者前往日本需要申请签证。日本提供多种签证类型，包括旅游签证、工作签证、学生签证等。旅游签证通常允许停留15-90天。"
      }
    },
    {
      "@type": "Question",
      "name": "哪些国家对中国人免签？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "截至2026年，中国护照可免签或落地签前往约80个国家和地区，包括泰国、新加坡、马尔代夫、塞尔维亚、阿联酋等。完整列表请查看我们的护照数据页面。"
      }
    }
  ]
}
</script>
```

### 4.3 国家页 Schema

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Country",
  "name": "日本",
  "alternateName": "Japan",
  "url": "https://example.com/country/japan",
  "image": "https://example.com/assets/images/countries/japan.jpg",
  "description": "日本数字游民完整指南：签证、东京大阪城市数据、生活成本、税务、网络、医疗",
  "containedInPlace": {
    "@type": "Continent",
    "name": "Asia"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 36.2048,
    "longitude": 138.2529
  },
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "population",
      "value": "125000000"
    },
    {
      "@type": "PropertyValue",
      "name": "gdpPerCapita",
      "value": "39285 USD"
    },
    {
      "@type": "PropertyValue",
      "name": "costOfLivingIndex",
      "value": "85.2"
    },
    {
      "@type": "PropertyValue",
      "name": "digitalNomadScore",
      "value": "87"
    }
  ]
}
</script>

<!-- BreadcrumbList Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "首页",
      "item": "https://example.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "国家",
      "item": "https://example.com/country"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "日本",
      "item": "https://example.com/country/japan"
    }
  ]
}
</script>

<!-- HowTo Schema (for visa process section) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "如何申请日本旅游签证",
  "description": "中国公民申请日本旅游签证的完整流程",
  "totalTime": "P7D",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "CNY",
    "value": "400"
  },
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "准备材料",
      "text": "准备护照、照片、申请表、行程单、资金证明等"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "提交申请",
      "text": "通过指定旅行社或签证中心提交"
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "等待审理",
      "text": "通常5-7个工作日"
    }
  ]
}
</script>
```

### 4.4 城市页 Schema

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "City",
  "name": "东京",
  "alternateName": "Tokyo",
  "containedInPlace": {
    "@type": "Country",
    "name": "日本"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 35.6762,
    "longitude": 139.6503
  },
  "population": {
    "@type": "QuantitativeValue",
    "value": "14000000"
  },
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "costOfLivingIndex",
      "value": "95"
    },
    {
      "@type": "PropertyValue",
      "name": "digitalNomadScore",
      "value": "92"
    },
    {
      "@type": "PropertyValue",
      "name": "internetSpeed",
      "value": "185 Mbps"
    }
  ]
}
</script>

<!-- LocalBusiness Schema for coworking spaces -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "LocalBusiness",
        "name": "WeWork 涩谷",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "东京",
          "addressCountry": "JP"
        },
        "priceRange": "$$"
      }
    }
  ]
}
</script>
```

### 4.5 签证页 Schema

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "GovernmentService",
  "name": "日本旅游签证",
  "serviceType": "Visa",
  "areaServed": {
    "@type": "Country",
    "name": "日本"
  },
  "audience": {
    "@type": "Audience",
    "audienceType": "中国护照持有者"
  },
  "availableChannel": {
    "@type": "ServiceChannel",
    "serviceType": "签证申请",
    "serviceUrl": "https://www.mofa.go.jp"
  },
  "termsOfService": "有效期3个月，停留15-90天",
  "serviceOutput": {
    "@type": "GovernmentPermit",
    "name": "日本旅游签证"
  }
}
</script>

<!-- HowTo Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "日本旅游签证申请指南",
  "description": "中国公民申请日本旅游签证的完整流程",
  "totalTime": "P7D",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "CNY",
    "value": "400"
  },
  "supply": [
    {
      "@type": "HowToSupply",
      "name": "护照原件"
    },
    {
      "@type": "HowToSupply",
      "name": "签证照片"
    }
  ],
  "tool": [
    {
      "@type": "HowToTool",
      "name": "签证申请表"
    }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "确认签证类型",
      "text": "根据行程确定申请单次、多次或过境签证"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "准备材料",
      "text": "护照、照片、申请表、行程单、资金证明"
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "提交申请",
      "text": "通过指定旅行社或签证中心提交"
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "等待审理",
      "text": "通常5-7个工作日"
    },
    {
      "@type": "HowToStep",
      "position": 5,
      "name": "领取护照",
      "text": "收到通知后领取护照和签证"
    }
  ]
}
</script>

<!-- FAQPage Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "日本旅游签证多久能办下来？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "通常5-7个工作日。加急服务可缩短至3个工作日，需额外费用。"
      }
    },
    {
      "@type": "Question",
      "name": "日本旅游签证费用是多少？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "签证费约200-400元人民币，具体取决于领区和签证类型。服务费另计。"
      }
    }
  ]
}
</script>
```

### 4.6 文章页 Schema

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "日本数字游民签证：从申请到落地的完整指南",
  "description": "2026日本数字游民签证完整申请攻略：资格条件、材料清单、申请流程、费用、时间线",
  "image": "https://example.com/assets/images/articles/japan-digital-nomad.jpg",
  "author": {
    "@type": "Person",
    "name": "作者名",
    "url": "https://github.com/author"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Global Mobility Infrastructure",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/assets/logo.png"
    }
  },
  "datePublished": "2026-01-15T00:00:00+08:00",
  "dateModified": "2026-01-15T00:00:00+08:00",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/article/japan-digital-nomad-visa-guide"
  },
  "articleSection": "签证指南",
  "wordCount": 5000,
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".article-title", ".article-body"]
  }
}
</script>
```

### 4.7 远程工作页 Schema

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "JobPosting",
        "title": "Senior Frontend Engineer",
        "description": "Remote frontend engineering position at Stripe",
        "hiringOrganization": {
          "@type": "Organization",
          "name": "Stripe",
          "sameAs": "https://stripe.com"
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "US"
          }
        },
        "jobLocationType": "TELECOMMUTE",
        "employmentType": "FULL_TIME",
        "baseSalary": {
          "@type": "MonetaryAmount",
          "currency": "USD",
          "value": {
            "@type": "QuantitativeValue",
            "minValue": 150000,
            "maxValue": 200000,
            "unitText": "YEAR"
          }
        },
        "datePosted": "2026-01-15",
        "validThrough": "2026-02-15",
        "url": "https://example.com/remote-jobs/job-12345"
      }
    }
  ]
}
</script>
```

### 4.8 数据库页 Schema

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Global Mobility Country Database",
  "description": "195个国家完整数据：签证、税务、生活成本、网络、医疗、教育",
  "url": "https://example.com/database/country",
  "creator": {
    "@type": "Organization",
    "name": "Global Mobility Infrastructure"
  },
  "license": "https://creativecommons.org/licenses/by-sa/4.0/",
  "distribution": [
    {
      "@type": "DataDownload",
      "encodingFormat": "JSON",
      "contentUrl": "https://example.com/api/v1/countries.json"
    },
    {
      "@type": "DataDownload",
      "encodingFormat": "CSV",
      "contentUrl": "https://example.com/api/v1/countries.csv"
    }
  ],
  "variableMeasured": [
    "population",
    "gdpPerCapita",
    "costOfLiving",
    "visaRequirements",
    "internetSpeed"
  ],
  "datePublished": "2026-01-01",
  "dateModified": "2026-01-15"
}
</script>
```

### 4.9 工具页 Schema

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "签证资格评估器",
  "description": "输入个人条件，自动匹配可申请的签证类型",
  "url": "https://example.com/tools/visa-eligibility",
  "applicationCategory": "TravelApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "CNY"
  },
  "featureList": [
    "智能签证匹配",
    "成功率评估",
    "材料清单生成",
    "时间线规划"
  ]
}
</script>
```

---

## 5. Open Graph / Twitter Card (社交分享优化)

### 5.1 全局 OG 设置

```html
<!-- Open Graph (Facebook, LinkedIn, etc.) -->
<meta property="og:site_name" content="Global Mobility Infrastructure">
<meta property="og:type" content="website">
<meta property="og:locale" content="zh_CN">
<meta property="og:locale:alternate" content="en_US">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@GlobalMobilityIO">
<meta name="twitter:creator" content="@GlobalMobilityIO">
```

### 5.2 首页 OG

```html
<meta property="og:title" content="Global Mobility Infrastructure — 中国护照全球生活数据平台">
<meta property="og:description" content="为中国人提供全球国家、签证、城市、远程工作等结构化数据。开源、社区驱动、数据驱动决策。">
<meta property="og:url" content="https://example.com/">
<meta property="og:image" content="https://example.com/assets/og/home.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Global Mobility Infrastructure - 3D地球与数据展示">
<meta name="twitter:title" content="Global Mobility Infrastructure — 中国护照全球生活数据平台">
<meta name="twitter:description" content="195个国家、1200+签证、50000+远程职位。数据驱动你的全球生活决策。">
<meta name="twitter:image" content="https://example.com/assets/og/home.jpg">
```

### 5.3 国家页 OG

```html
<meta property="og:type" content="article">
<meta property="og:title" content="日本 — 数字游民指南、签证、生活成本、城市数据">
<meta property="og:description" content="日本数字游民完整指南：签证要求、东京/大阪等20+城市数据、生活成本、税务、网络、医疗。">
<meta property="og:url" content="https://example.com/country/japan">
<meta property="og:image" content="https://example.com/assets/og/country/japan.jpg">
<meta property="og:image:alt" content="日本富士山与东京天际线">
<meta property="article:published_time" content="2026-01-15T00:00:00+08:00">
<meta property="article:modified_time" content="2026-01-15T00:00:00+08:00">
<meta property="article:section" content="国家指南">
<meta property="article:tag" content="日本,数字游民,签证,生活成本">
<meta name="twitter:title" content="日本 — 数字游民完整指南">
<meta name="twitter:description" content="签证、城市、生活成本、税务、网络、医疗，全面数据支持。">
<meta name="twitter:image" content="https://example.com/assets/og/country/japan.jpg">
<meta name="twitter:label1" content="数字游民评分">
<meta name="twitter:data1" content="87/100">
<meta name="twitter:label2" content="生活成本">
<meta name="twitter:data2" content="高">
```

### 5.4 签证页 OG

```html
<meta property="og:type" content="article">
<meta property="og:title" content="日本旅游签证申请指南 — 材料、流程、费用、成功率">
<meta property="og:description" content="2026日本旅游签证完整申请攻略：材料清单、详细流程、费用、成功率、常见问题。基于1000+真实申请案例。">
<meta property="og:url" content="https://example.com/visa/japan-tourist">
<meta property="og:image" content="https://example.com/assets/og/visa/japan-tourist.jpg">
<meta name="twitter:title" content="日本旅游签证申请指南">
<meta name="twitter:description" content="成功率92%，基于1000+真实案例。">
<meta name="twitter:label1" content="处理时间">
<meta name="twitter:data1" content="5-7天">
<meta name="twitter:label2" content="费用">
<meta name="twitter:data2" content="¥200-400">
```

### 5.5 文章页 OG

```html
<meta property="og:type" content="article">
<meta property="og:title" content="日本数字游民签证：从申请到落地的完整指南">
<meta property="og:description" content="2026日本数字游民签证完整申请攻略：资格条件、材料清单、申请流程、费用、时间线。基于最新政策和真实案例。">
<meta property="og:url" content="https://example.com/article/japan-digital-nomad-visa-guide">
<meta property="og:image" content="https://example.com/assets/og/articles/japan-digital-nomad.jpg">
<meta property="article:published_time" content="2026-01-15T00:00:00+08:00">
<meta property="article:modified_time" content="2026-01-15T00:00:00+08:00">
<meta property="article:author" content="https://github.com/author">
<meta property="article:section" content="签证指南">
<meta property="article:tag" content="日本,数字游民签证,申请攻略">
<meta name="twitter:title" content="日本数字游民签证完整指南">
<meta name="twitter:description" content="从申请到落地，每一步都讲清楚。">
<meta name="twitter:image" content="https://example.com/assets/og/articles/japan-digital-nomad.jpg">
```

### 5.6 OG 图片生成策略

```javascript
// OG 图片自动生成
// 每个页面类型有对应的 OG 模板

const OG_TEMPLATES = {
  home: {
    size: [1200, 630],
    elements: ['logo', '3d-earth-screenshot', 'tagline', 'stats-bar'],
    background: 'gradient-dark-blue'
  },
  country: {
    size: [1200, 630],
    elements: ['country-flag', 'country-name', 'score-badge', 'key-stats', 'photo'],
    background: 'country-photo-overlay'
  },
  city: {
    size: [1200, 630],
    elements: ['city-photo', 'city-name', 'country', 'nomad-score', 'cost-index'],
    background: 'city-photo-overlay'
  },
  visa: {
    size: [1200, 630],
    elements: ['country-flag', 'visa-type', 'success-rate', 'processing-time', 'fee'],
    background: 'gradient-blue'
  },
  article: {
    size: [1200, 630],
    elements: ['cover-image', 'title', 'author-avatar', 'read-time', 'category-badge'],
    background: 'cover-image-overlay'
  },
  tool: {
    size: [1200, 630],
    elements: ['tool-icon', 'tool-name', 'description', 'preview-screenshot'],
    background: 'gradient-dark'
  }
};

// 构建时自动生成 OG 图片
// 使用 Canvas API / Sharp / Puppeteer 生成
```

---

## 6. RSS Feed (内容分发)

### 6.1 主 RSS Feed

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Global Mobility Infrastructure</title>
    <link>https://example.com</link>
    <description>中国护照全球生活数据平台 — 国家、签证、城市、远程工作</description>
    <language>zh-CN</language>
    <lastBuildDate>Mon, 15 Jan 2026 00:00:00 +0800</lastBuildDate>
    <atom:link href="https://example.com/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>https://example.com/assets/logo-rss.png</url>
      <title>Global Mobility Infrastructure</title>
      <link>https://example.com</link>
    </image>
    
    <item>
      <title>日本数字游民签证：从申请到落地的完整指南</title>
      <link>https://example.com/article/japan-digital-nomad-visa-guide</link>
      <guid isPermaLink="true">https://example.com/article/japan-digital-nomad-visa-guide</guid>
      <pubDate>Mon, 15 Jan 2026 00:00:00 +0800</pubDate>
      <dc:creator>作者名</dc:creator>
      <category>签证指南</category>
      <category>日本</category>
      <description>2026日本数字游民签证完整申请攻略...</description>
      <content:encoded>
        <![CDATA[
          <h1>日本数字游民签证：从申请到落地的完整指南</h1>
          <p>2026年最新...</p>
          <img src="https://example.com/assets/images/articles/japan-digital-nomad.jpg"/>
        ]]>
      </content:encoded>
    </item>
  </channel>
</rss>
```

### 6.2 分类 RSS Feed

```xml
<!-- /rss/visa.xml — 签证相关更新 -->
<!-- /rss/remote-jobs.xml — 远程职位更新 -->
<!-- /rss/country/japan.xml — 日本相关更新 -->
<!-- /rss/city.xml — 城市数据更新 -->
<!-- /rss/data.xml — 数据更新日志 -->
```

### 6.3 RSS 自动发现

```html
<!-- 在 <head> 中 -->
<link rel="alternate" type="application/rss+xml" 
      title="Global Mobility Infrastructure — 全部更新" 
      href="https://example.com/rss.xml">
<link rel="alternate" type="application/rss+xml" 
      title="签证指南" 
      href="https://example.com/rss/visa.xml">
<link rel="alternate" type="application/rss+xml" 
      title="远程工作" 
      href="https://example.com/rss/remote-jobs.xml">
```

### 6.4 RSS 内容策略

| 更新类型 | 触发条件 | 包含内容 |
|----------|----------|----------|
| 新文章 | 文章发布 | 全文 + 图片 |
| 数据更新 | 数据修改 | 变更摘要 + 链接 |
| 新职位 | 职位新增 | 职位列表 (前10) |
| 政策变动 | 签证政策变更 | 变更说明 + 影响分析 |
| 版本发布 | 网站版本更新 | 变更日志 + 新功能 |

---

## 7. Sitemap (站点地图)

### 7.1 主 Sitemap Index

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap/static.xml</loc>
    <lastmod>2026-01-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap/country.xml</loc>
    <lastmod>2026-01-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap/city.xml</loc>
    <lastmod>2026-01-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap/visa.xml</loc>
    <lastmod>2026-01-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap/remote-jobs.xml</loc>
    <lastmod>2026-01-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap/article.xml</loc>
    <lastmod>2026-01-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap/tools.xml</loc>
    <lastmod>2026-01-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap/database.xml</loc>
    <lastmod>2026-01-15</lastmod>
  </sitemap>
</sitemapindex>
```

### 7.2 国家 Sitemap (示例)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  
  <!-- 日本国家页 -->
  <url>
    <loc>https://example.com/country/japan</loc>
    <lastmod>2026-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="https://example.com/country/japan"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://example.com/en/country/japan"/>
    <image:image>
      <image:loc>https://example.com/assets/images/countries/japan.jpg</image:loc>
      <image:title>日本 — 富士山与东京</image:title>
      <image:caption>日本数字游民完整指南</image:caption>
    </image:image>
  </url>
  
  <!-- 日本签证页 -->
  <url>
    <loc>https://example.com/visa/japan-tourist</loc>
    <lastmod>2026-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- 日本城市页 — 东京 -->
  <url>
    <loc>https://example.com/city/tokyo</loc>
    <lastmod>2026-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- 日本城市页 — 大阪 -->
  <url>
    <loc>https://example.com/city/osaka</loc>
    <lastmod>2026-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
</urlset>
```

### 7.3 Sitemap 优先级策略

| 页面类型 | 优先级 | 更新频率 | 说明 |
|----------|--------|----------|------|
| 首页 | 1.0 | weekly | 最高权重 |
| 支柱页（国家/签证） | 0.9 | weekly | 核心内容 |
| 热门城市页 | 0.8 | weekly | 高流量 |
| 签证详情页 | 0.8 | weekly | 搜索量大 |
| 文章页 | 0.7 | monthly | 长期价值 |
| 普通城市页 | 0.7 | monthly | 中等流量 |
| 工具页 | 0.6 | monthly | 功能页面 |
| 数据库页 | 0.5 | daily | 数据更新频繁 |
| 远程工作页 | 0.5 | daily | 实时更新 |
| 关于/联系 | 0.3 | yearly | 低频更新 |
| 404 | 0.0 | never | 不索引 |
| 搜索结果 | 0.0 | never | 不索引 |

### 7.4 Sitemap 自动化

```javascript
// sitemap-generator.js
// 构建时自动生成所有 sitemap

const generateSitemaps = () => {
  // 1. 读取所有数据文件
  const countries = loadCountries();
  const cities = loadCities();
  const visas = loadVisas();
  const articles = loadArticles();
  const jobs = loadJobs();
  
  // 2. 生成各分类 sitemap
  generateStaticSitemap();
  generateCountrySitemap(countries);
  generateCitySitemap(cities);
  generateVisaSitemap(visas);
  generateArticleSitemap(articles);
  generateJobSitemap(jobs);
  generateToolSitemap();
  generateDatabaseSitemap();
  
  // 3. 生成 sitemap index
  generateSitemapIndex();
  
  // 4. 压缩 (gzip)
  compressSitemaps();
};

// 运行
// npm run generate:sitemap
```

### 7.5 Sitemap 提交

```
# robots.txt 中声明
Sitemap: https://example.com/sitemap.xml

# Google Search Console 提交
# Bing Webmaster Tools 提交
# 通过 API 自动提交新页面
```

---

## 8. Robots.txt (爬虫控制)

```txt
# Global Mobility Infrastructure — Robots.txt
# Last Updated: 2026-01-15

User-agent: *
Allow: /

# 禁止爬虫访问的路径
Disallow: /search?q=*
Disallow: /api/
Disallow: /internal/
Disallow: /admin/
Disallow: /tmp/
Disallow: /*?*utm_
Disallow: /*?*ref=

# 爬取频率建议
Crawl-delay: 1

# Sitemap
Sitemap: https://example.com/sitemap.xml

# Google-specific
User-agent: Googlebot
Allow: /
Crawl-delay: 0.5

# Bing-specific
User-agent: Bingbot
Allow: /
Crawl-delay: 1

# AI Search Crawlers (允许)
User-agent: ChatGPT-User
Allow: /

User-agent: GPTBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot
Allow: /

User-agent: anthropic-ai
Allow: /

# 禁止 AI 训练爬虫 (可选，目前允许)
# User-agent: GPTBot
# Disallow: /
```

### 8.1 机器人元标签

```html
<!-- 默认：索引并跟踪链接 -->
<meta name="robots" content="index, follow">

<!-- 搜索结果页：不索引 -->
<meta name="robots" content="noindex, follow">

<!-- 404 页面：不索引不跟踪 -->
<meta name="robots" content="noindex, nofollow">

<!-- 旧版本页面：规范到新版 -->
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="https://example.com/new-page">

<!-- 分页页面：索引但不跟踪 -->
<meta name="robots" content="index, nofollow">
<link rel="canonical" href="https://example.com/country?page=1">
```

---

## 9. Canonical 标签 (规范化)

### 9.1 全局规则

```html
<!-- 每个页面必须有唯一的 canonical -->
<!-- 首页 -->
<link rel="canonical" href="https://example.com/">

<!-- 国家页 -->
<link rel="canonical" href="https://example.com/country/japan">

<!-- 城市页 -->
<link rel="canonical" href="https://example.com/city/tokyo">

<!-- 签证页 -->
<link rel="canonical" href="https://example.com/visa/japan-tourist">

<!-- 文章页 -->
<link rel="canonical" href="https://example.com/article/japan-digital-nomad-visa-guide">
```

### 9.2 分页 Canonical

```html
<!-- 分页页面：canonical 指向第一页 -->
<!-- /country?page=2 -->
<link rel="canonical" href="https://example.com/country">
<link rel="prev" href="https://example.com/country">
<link rel="next" href="https://example.com/country?page=3">

<!-- 或使用 view-all 页面作为 canonical -->
<link rel="canonical" href="https://example.com/country/all">
```

### 9.3 多语言 Canonical

```html
<!-- 中文页 -->
<link rel="canonical" href="https://example.com/country/japan">
<link rel="alternate" hreflang="zh-CN" href="https://example.com/country/japan">
<link rel="alternate" hreflang="en" href="https://example.com/en/country/japan">
<link rel="alternate" hreflang="x-default" href="https://example.com/country/japan">

<!-- 英文页 -->
<link rel="canonical" href="https://example.com/en/country/japan">
<link rel="alternate" hreflang="zh-CN" href="https://example.com/country/japan">
<link rel="alternate" hreflang="en" href="https://example.com/en/country/japan">
<link rel="alternate" hreflang="x-default" href="https://example.com/country/japan">
```

### 9.4 参数处理

```html
<!-- 过滤参数：canonical 指向无参数版本 -->
<!-- /country?region=asia -->
<link rel="canonical" href="https://example.com/country">

<!-- 排序参数：canonical 指向默认排序 -->
<!-- /country?sort=population -->
<link rel="canonical" href="https://example.com/country">
```

---

## 10. Programmatic SEO (程序化 SEO)

### 10.1 页面生成策略

```javascript
// 程序化生成页面的规则
const PROGRAMMATIC_PAGES = {
  // 1. 国家详情页: 195 页
  country: {
    source: 'data/entities/country/*.json',
    template: 'templates/country.html',
    urlPattern: '/country/{id}',
    count: 195
  },
  
  // 2. 城市详情页: 2,000+ 页
  city: {
    source: 'data/entities/city/*.json',
    template: 'templates/city.html',
    urlPattern: '/city/{id}',
    count: 2000
  },
  
  // 3. 签证详情页: 1,200+ 页
  visa: {
    source: 'data/entities/visa/*.json',
    template: 'templates/visa.html',
    urlPattern: '/visa/{id}',
    count: 1200
  },
  
  // 4. 国家-签证组合页: 195 × 10 = 1,950 页
  countryVisa: {
    source: 'data/relations/country-visa/*.json',
    template: 'templates/country-visa.html',
    urlPattern: '/country/{country-id}/visa/{visa-type}',
    count: 1950
  },
  
  // 5. 国家-城市对比页: C(195, 2) ≈ 18,900 页
  countryCompare: {
    template: 'templates/country-compare.html',
    urlPattern: '/compare/country/{id1}-vs-{id2}',
    count: 18900
  },
  
  // 6. 城市-城市对比页: C(2000, 2) ≈ 2,000,000 页 (仅生成热门组合)
  cityCompare: {
    template: 'templates/city-compare.html',
    urlPattern: '/compare/city/{id1}-vs-{id2}',
    count: 50000  // 仅热门组合
  },
  
  // 7. 签证-签证对比页
  visaCompare: {
    template: 'templates/visa-compare.html',
    urlPattern: '/compare/visa/{id1}-vs-{id2}',
    count: 10000
  },
  
  // 8. 国家-签证列表页: 195 页
  countryVisaList: {
    template: 'templates/country-visa-list.html',
    urlPattern: '/country/{id}/visa',
    count: 195
  },
  
  // 9. 国家-城市列表页: 195 页
  countryCityList: {
    template: 'templates/country-city-list.html',
    urlPattern: '/country/{id}/city',
    count: 195
  },
  
  // 10. 远程工作详情页: 50,000+ 页
  remoteJob: {
    source: 'data/entities/remote-job/*.json',
    template: 'templates/remote-job.html',
    urlPattern: '/remote-jobs/{id}',
    count: 50000
  }
};

// 总页面数: 195 + 2000 + 1200 + 1950 + 18900 + 50000 + 10000 + 195 + 195 + 50000 = ~134,635 页
```

### 10.2 程序化 Meta 生成

```javascript
// 每个程序化页面的 Meta 自动生成

function generateMeta(pageType, data) {
  const metaGenerators = {
    country: (country) => ({
      title: `${country.name} — 数字游民指南、签证、生活成本、城市数据 | Global Mobility Infrastructure`,
      description: `${country.name}数字游民完整指南：签证要求、${country.topCities?.join('/')}等城市数据、生活成本、税务、网络、医疗。基于真实数据的决策支持。`,
      keywords: `${country.name}, ${country.nameEn}, 数字游民, 签证, 生活成本, 远程工作`,
      ogTitle: `${country.name} — 数字游民完整指南`,
      ogDescription: `签证、城市、生活成本、税务、网络、医疗，全面数据支持。`,
      schema: generateCountrySchema(country)
    }),
    
    city: (city) => ({
      title: `${city.name} — 数字游民生活成本、共享办公、网络数据 | ${city.countryName}`,
      description: `${city.name}数字游民完整指南：生活成本、共享办公空间、网速、天气、安全、社区。从住宿到医疗，全面数据支持。`,
      keywords: `${city.name}, ${city.nameEn}, 数字游民, 生活成本, 共享办公, 远程工作`,
      ogTitle: `${city.name} — 数字游民完整指南`,
      ogDescription: `生活成本、共享办公、网络、安全，全面数据。`,
      schema: generateCitySchema(city)
    }),
    
    visa: (visa) => ({
      title: `${visa.name}申请指南 — 材料、流程、费用、成功率 | ${visa.year}`,
      description: `${visa.year}${visa.name}完整申请攻略：材料清单、详细流程、费用、成功率、常见问题。基于${visa.sampleSize}+真实申请案例数据。`,
      keywords: `${visa.name}, ${visa.countryName}签证, 申请攻略, 材料清单, 费用`,
      ogTitle: `${visa.name}申请指南`,
      ogDescription: `成功率${visa.successRate}%，基于${visa.sampleSize}+真实案例。`,
      schema: generateVisaSchema(visa)
    }),
    
    compare: (a, b) => ({
      title: `${a.name} vs ${b.name} — 数字游民对比 | 生活成本、签证、网络`,
      description: `${a.name}和${b.name}数字游民对比：生活成本、签证难度、网络质量、安全指数、税务负担。数据驱动选择。`,
      keywords: `${a.name} vs ${b.name}, 对比, 数字游民, 生活成本`,
      schema: generateCompareSchema(a, b)
    })
  };
  
  return metaGenerators[pageType](data);
}
```

### 10.3 程序化内容生成

```javascript
// 程序化生成页面内容，确保唯一性和价值

function generateCountryContent(country) {
  return {
    // 1. 自动生成的简介段落（基于数据模板）
    introduction: generateIntroduction(country),
    
    // 2. 数据表格（自动从数据文件渲染）
    dataTables: generateDataTables(country),
    
    // 3. 自动 FAQ（基于数据生成常见问题）
    faq: generateFAQ(country),
    
    // 4. 相关链接（自动从关联数据计算）
    relatedLinks: generateRelatedLinks(country),
    
    // 5. 对比卡片（自动选择相似国家）
    compareCards: generateCompareCards(country),
    
    // 6. 数据可视化（自动渲染图表）
    charts: generateCharts(country)
  };
}

function generateFAQ(country) {
  // 基于数据自动生成 FAQ
  const faqs = [];
  
  // 签证相关
  faqs.push({
    question: `中国护照去${country.name}需要签证吗？`,
    answer: country.visaStatus === 'visa_free' 
      ? `好消息！中国公民前往${country.name}可以免签停留${country.visaFreeDays}天。`
      : `是的，需要申请签证。${country.name}提供${country.visaTypes?.length}种签证类型。`
  });
  
  // 生活成本
  faqs.push({
    question: `在${country.name}生活一个月需要多少钱？`,
    answer: `根据我们的数据，在${country.name}的月度生活成本约为$${country.monthlyCost?.budget}-$${country.monthlyCost?.luxury}美元，取决于生活方式。`
  });
  
  // 远程工作
  faqs.push({
    question: `${country.name}适合数字游民吗？`,
    answer: `${country.name}的数字游民评分为${country.nomadScore}/100。${country.nomadScore > 80 ? '非常适合！' : '可以考虑，但需注意某些方面。'}`
  });
  
  return faqs;
}
```

### 10.4 内容唯一性保证

```javascript
// 确保每个程序化页面有独特内容
const UNIQUE_CONTENT_STRATEGIES = {
  // 1. 数据驱动差异：每个页面数据不同，自然内容不同
  dataDriven: true,
  
  // 2. 模板变量系统：使用数十个变量填充模板
  templateVariables: [
    'country.name', 'country.nameEn', 'country.population',
    'country.nomadScore', 'country.costIndex', 'country.safetyIndex',
    'country.topCities', 'country.visaTypes', 'country.bestSeason',
    'country.currency', 'country.language', 'country.timezone'
  ],
  
  // 3. 条件内容：根据数据条件显示不同内容
  conditionalContent: {
    'nomadScore > 90': 'display: "top-tier-nomad-destination"',
    'nomadScore > 80': 'display: "great-nomad-destination"',
    'visaFree': 'display: "visa-free-highlight"',
    'hasDigitalNomadVisa': 'display: "dn-visa-section"'
  },
  
  // 4. 动态排序：不同页面显示不同的"相关"内容
  dynamicRelated: {
    algorithm: 'similarity + popularity + randomness',
    maxItems: 6
  },
  
  // 5. 时间戳和更新信息：显示数据的时效性
  freshnessIndicator: {
    showLastUpdated: true,
    showDataSource: true,
    showVerificationDate: true
  }
};
```

---

## 11. AI 搜索优化 (AI-Native SEO)

### 11.1 通用 AI 搜索优化原则

```
┌─────────────────────────────────────────────────┐
│  AI 搜索引擎优化原则                              │
├─────────────────────────────────────────────────┤
│  1. 直接回答 (Direct Answers)                   │
│     - 首段直接回答问题                            │
│     - 使用问答格式                               │
│     - 提供简洁摘要                                │
│                                                   │
│  2. 结构化内容 (Structured Content)               │
│     - 使用标题层级 (H1 > H2 > H3)               │
│     - 列表和表格                                 │
│     - 步骤编号                                   │
│                                                   │
│  3. 可信信号 (Trust Signals)                    │
│     - 数据来源标注                               │
│     - 最后更新日期                               │
│     - 作者信息                                   │
│     - 引用和链接                                 │
│                                                   │
│  4. 语义完整性 (Semantic Completeness)          │
│     - 覆盖主题的所有方面                         │
│     - 回答相关子问题                             │
│     - 提供比较和对比                             │
│                                                   │
│  5. 实体识别 (Entity Recognition)               │
│     - 明确标记实体 (国家、城市、签证类型)         │
│     - Schema.org 标记                            │
│     - 内部知识图谱                               │
└─────────────────────────────────────────────────┘
```

### 11.2 Google 优化

```html
<!-- Google 特定的优化 -->

<!-- 1. 丰富结果 (Rich Results) -->
<!-- 使用完整的 Schema.org 标记（见第4节） -->

<!-- 2. 知识面板优化 -->
<!-- 确保品牌、创始人、数据等结构化数据完整 -->

<!-- 3. Google Discover -->
<!-- 大图片 (1200px+)、引人入胜的标题、时事性内容 -->
<meta name="google" content="nositelinkssearchbox">
<meta name="google" content="max-snippet:-1, max-image-preview:large, max-video-preview:-1">

<!-- 4. Core Web Vitals -->
<!-- LCP < 2.5s, FID < 100ms, CLS < 0.1 -->
<!-- 通过 Performance API 上报 -->

<!-- 5. Mobile-First Indexing -->
<!-- 移动端内容 = 桌面端内容 -->
<!-- 响应式设计 -->
```

### 11.3 Bing 优化

```html
<!-- Bing 特定的优化 -->

<!-- 1. Bing Webmaster Tools -->
<!-- 提交 Sitemap -->
<!-- 配置 URL 提交 API -->

<!-- 2. Bing 丰富结果 -->
<!-- 与 Google Schema 相同，Bing 也支持 -->

<!-- 3. Bing 图片搜索 -->
<!-- 高质量图片 -->
<!-- 描述性文件名和 alt 文本 -->
<!-- 图片结构化数据 -->

<!-- 4. Bing 实体 -->
<!-- 确保实体数据完整（国家、城市等） -->

<!-- 5. Bing 即时答案 -->
<!-- 表格数据 -->
<!-- 列表格式 -->
<!-- 问答格式 -->
```

### 11.4 Perplexity 优化

```
Perplexity 优化策略：

1. 直接回答格式
   - 首段 50-100 字直接回答核心问题
   - 使用 "是/否" + 简要解释开头

2. 引用友好
   - 使用清晰的锚文本链接
   - 提供可验证的数据来源
   - 引用格式标准化

3. 长内容偏好
   - Perplexity 偏好详细内容
   - 2000+ 字文章表现更好
   - 深度分析优于表面概述

4. 时效性
   - 日期标注非常重要
   - "2026年最新"等标识
   - 定期更新旧内容

5. 多维度回答
   - 覆盖问题的多个方面
   - 提供对比分析
   - 包含不同观点
```

### 11.5 ChatGPT Search 优化

```
ChatGPT Search 优化策略：

1. 对话式内容
   - 使用自然语言
   - 问答格式
   - 对话式标题

2. 结构化回答
   - 步骤列表
   - 要点总结
   - 对比表格

3. 上下文完整性
   - 提供完整背景
   - 解释术语
   - 假设读者无知

4.  actionable 内容
   - 具体步骤
   - 可操作的清单
   - 工具推荐

5. 多格式内容
   - 文本 + 代码 + 表格
   - 视觉化数据
   - 交互式工具
```

### 11.6 Gemini 优化

```
Gemini 优化策略：

1. 多模态友好
   - 高质量图片
   - 信息图表
   - 视频内容

2. 结构化数据
   - 表格数据
   - 列表格式
   - 代码块

3. 技术准确性
   - 精确数据
   - 最新信息
   - 来源引用

4. 实体关联
   - 清晰的实体标记
   - 关系数据
   - 知识图谱连接
```

### 11.7 Claude 优化

```
Claude 优化策略：

1. 详细解释
   - 深度分析
   - 逻辑清晰的论证
   - 详细示例

2. 安全可信
   - 免责声明
   - 专业审核
   - 权威来源

3. 结构化写作
   - 清晰的章节
   - 逻辑递进
   - 总结要点

4.  nuanced 观点
   - 承认复杂性
   - 提供多种选择
   - 权衡分析
```

### 11.8 通用 AI 搜索优化清单

```html
<!-- AI 搜索优化的页面结构 -->

<!-- 1. 首段直接回答 (Featured Snippet 优化) -->
<p class="direct-answer">
  <strong>日本旅游签证通常需要5-7个工作日办理。</strong>
  具体时长取决于领区和申请类型，单次签证约5个工作日，
  多次签证可能需要7-10个工作日。加急服务可缩短至3个工作日。
</p>

<!-- 2. 问答区块 (FAQ Schema + 可见 FAQ) -->
<section class="faq-section">
  <h2>常见问题</h2>
  <details>
    <summary>日本旅游签证多久能办下来？</summary>
    <p>通常5-7个工作日...</p>
  </details>
  <!-- 更多 FAQ -->
</section>

<!-- 3. 数据表格 (AI 偏好提取表格数据) -->
<table class="data-table">
  <caption>日本旅游签证 vs 工作签证对比</caption>
  <thead>...</thead>
  <tbody>...</tbody>
</table>

<!-- 4. 步骤列表 (HowTo Schema + 可见步骤) -->
<ol class="steps">
  <li><strong>确认签证类型</strong> — 根据行程...</li>
  <li><strong>准备材料</strong> — 护照、照片...</li>
  <li><strong>提交申请</strong> — 通过...</li>
</ol>

<!-- 5. 要点总结 (AI 可直接提取) -->
<div class="key-takeaways">
  <h3>要点总结</h3>
  <ul>
    <li>日本旅游签证处理时间：5-7个工作日</li>
    <li>费用：200-400元人民币</li>
    <li>停留时长：15-90天</li>
    <li>成功率：约92%</li>
  </ul>
</div>

<!-- 6. 引用和来源 -->
<div class="sources">
  <h3>数据来源</h3>
  <ul>
    <li><a href="https://www.mofa.go.jp">日本外务省</a> — 官方签证政策</li>
    <li><a href="https://www.example.com">社区统计</a> — 1,234个申请案例</li>
  </ul>
</div>

<!-- 7. 最后更新日期 -->
<p class="last-updated">
  <time datetime="2026-01-15">最后更新：2026年1月15日</time>
  <span>数据已验证</span>
</p>
```

### 11.9 AI 搜索内容模板

```markdown
# 页面标题（包含核心关键词）

## 直接回答（50-100字）
[直接、简洁地回答核心问题]

## 详细解释
[深入解释背景、原因、影响]

## 数据/表格
[关键数据表格，便于AI提取]

## 步骤/流程
[编号步骤，清晰可执行]

## 对比/选择
[如果适用，提供对比分析]

## 常见问题（FAQ）
[5-10个相关问题，每个直接回答]

## 要点总结
[ bullet points 总结核心信息]

## 相关资源
[内部链接到相关页面]

## 来源/参考
[列出所有数据来源]

## 更新记录
[最后更新日期 + 更新内容]
```

---

## 12. 100,000 页面 SEO 方案

### 12.1 页面分层策略

```
Tier 1: 核心页面 (100 页) — 手动优化，最高优先级
├── 首页
├── 主要国家页 (20)
├── 主要城市页 (30)
├── 热门签证页 (30)
├── 核心工具页 (6)
├── 支柱文章页 (10)
└── 系统页面 (关于、联系、路线图等)

Tier 2: 重要页面 (1,000 页) — 半自动生成，高优先级
├── 所有国家页 (195)
├── 热门城市页 (200)
├── 所有签证页 (500)
├── 工具子页 (50)
└── 热门文章页 (55)

Tier 3: 长尾页面 (10,000 页) — 程序化生成，中等优先级
├── 所有城市页 (2,000)
├── 国家-签证组合页 (2,000)
├── 国家-城市列表页 (195)
├── 签证对比页 (1,000)
├── 城市对比页 (2,000)
└── 文章子页 (2,805)

Tier 4: 超长尾页面 (89,000 页) — 程序化生成，按需索引
├── 国家-国家对比页 (18,900)
├── 城市-城市对比页 (50,000)
├── 远程工作详情页 (20,000)
├── 数据库子页 (100)
└── 其他组合页 (10,000)
```

### 12.2 技术架构 (支撑 10 万页)

```
┌─────────────────────────────────────────────────┐
│  CDN (Cloudflare) — 全球缓存 + 边缘计算          │
├─────────────────────────────────────────────────┤
│  静态页面生成 (SSG)                               │
│  - 构建时生成所有 HTML 页面                        │
│  - 预渲染 + 增量静态生成 (ISR)                     │
│  - 每页 < 100KB HTML                             │
├─────────────────────────────────────────────────┤
│  数据层                                          │
│  - JSON 数据文件 (Git 版本控制)                    │
│  - 构建时读取并注入页面                             │
│  - 增量更新：仅变更页面重新构建                     │
├─────────────────────────────────────────────────┤
│  构建优化                                        │
│  - 并行构建 (多线程)                               │
│  - 增量构建 (仅变更)                               │
│  - 分片 Sitemap (每片 10,000 URL)                 │
│  - 增量 Sitemap 更新                              │
├─────────────────────────────────────────────────┤
│  索引策略                                        │
│  - 核心页面：主动提交 + 高频爬取                     │
│  - 重要页面：Sitemap + 定期爬取                     │
│  - 长尾页面：Sitemap 提交，按需索引                  │
│  - 超长尾：Noindex 或条件索引                        │
└─────────────────────────────────────────────────┘
```

### 12.3 构建系统

```javascript
// build.js — 10万页构建系统
const { Worker } = require('worker_threads');
const fs = require('fs');
const path = require('path');

const BUILD_CONFIG = {
  // 分批构建，避免内存溢出
  batchSize: 1000,
  workers: 8,
  
  // 增量构建
  incremental: true,
  cacheDir: '.build-cache',
  
  // 输出目录
  outputDir: 'docs',
  
  // 页面类型
  pageTypes: [
    { type: 'country', count: 195, priority: 'high' },
    { type: 'city', count: 2000, priority: 'high' },
    { type: 'visa', count: 1200, priority: 'high' },
    { type: 'country-visa', count: 1950, priority: 'medium' },
    { type: 'country-compare', count: 18900, priority: 'medium' },
    { type: 'city-compare', count: 50000, priority: 'low' },
    { type: 'visa-compare', count: 10000, priority: 'medium' },
    { type: 'remote-job', count: 50000, priority: 'high' },
    { type: 'article', count: 500, priority: 'high' },
    { type: 'tool', count: 6, priority: 'high' }
  ]
};

async function build() {
  console.log('🏗️  Starting 100,000 page build...');
  
  // 1. 加载数据
  const data = await loadAllData();
  
  // 2. 分批生成页面
  for (const pageType of BUILD_CONFIG.pageTypes) {
    await generatePagesInBatches(pageType, data);
  }
  
  // 3. 生成 Sitemap
  await generateSitemaps();
  
  // 4. 生成 RSS
  await generateRSSFeeds();
  
  // 5. 验证
  await validateBuild();
  
  console.log('✅ Build complete!');
}

async function generatePagesInBatches(pageType, data) {
  const { type, count } = pageType;
  const batches = Math.ceil(count / BUILD_CONFIG.batchSize);
  
  for (let i = 0; i < batches; i++) {
    const start = i * BUILD_CONFIG.batchSize;
    const end = Math.min(start + BUILD_CONFIG.batchSize, count);
    
    // 使用 Worker 线程并行生成
    const worker = new Worker('./build-worker.js', {
      workerData: { type, start, end, data }
    });
    
    await new Promise((resolve, reject) => {
      worker.on('message', resolve);
      worker.on('error', reject);
    });
  }
}

build();
```

### 12.4 索引控制策略

```javascript
// 索引控制策略
const INDEXING_STRATEGY = {
  // 核心页面：必须索引
  core: {
    pages: ['/', '/country/*', '/visa/*', '/city/*', '/article/*'],
    robots: 'index, follow',
    sitemap: true,
    priority: 1.0,
    submitToSearchEngines: true
  },
  
  // 重要页面：索引
  important: {
    pages: ['/tools/*', '/database/*', '/remote-jobs/*'],
    robots: 'index, follow',
    sitemap: true,
    priority: 0.7
  },
  
  // 长尾页面：索引但低优先级
  longtail: {
    pages: ['/compare/*'],
    robots: 'index, follow',
    sitemap: true,
    priority: 0.3
  },
  
  // 超长尾页面：条件索引
  ultralongtail: {
    pages: ['/compare/city/*'],
    robots: 'index, follow',
    sitemap: true,
    priority: 0.1,
    // 仅索引高流量组合
    condition: (page) => page.popularityScore > 50
  },
  
  // 不索引页面
  noindex: {
    pages: ['/search', '/search/*', '/404', '/internal/*'],
    robots: 'noindex, nofollow',
    sitemap: false
  }
};
```

### 12.5 性能优化 (10万页)

```javascript
// 性能优化策略
const PERFORMANCE_OPTIMIZATION = {
  // HTML 大小控制
  maxHtmlSize: '100KB', // 每页 HTML 不超过 100KB
  
  // 关键 CSS 内联
  criticalCss: {
    inline: true,
    maxSize: '14KB'
  },
  
  // 图片优化
  images: {
    format: 'webp',
    lazyLoad: true,
    responsive: true,
    maxSize: '50KB' // 每页图片总大小
  },
  
  // JavaScript
  js: {
    async: true,
    defer: true,
    minify: true,
    codeSplit: true
  },
  
  // 缓存策略
  caching: {
    html: '1h',      // HTML 1小时缓存
    css: '1y',       // CSS 1年缓存
    js: '1y',        // JS 1年缓存
    images: '1y',    // 图片 1年缓存
    data: '1d'       // 数据 1天缓存
  },
  
  // CDN 配置
  cdn: {
    provider: 'cloudflare',
    edgeCaching: true,
    imageOptimization: true,
    brotliCompression: true
  }
};
```

### 12.6 监控与分析

```javascript
// SEO 监控系统
const SEO_MONITORING = {
  // 索引监控
  indexing: {
    google: {
      api: 'Google Search Console API',
      checkFrequency: 'daily',
      alerts: ['indexDrop > 10%', 'crawlErrors > 100']
    },
    bing: {
      api: 'Bing Webmaster API',
      checkFrequency: 'daily'
    }
  },
  
  // 排名监控
  rankings: {
    keywords: ['数字游民', '日本签证', '远程工作'],
    checkFrequency: 'weekly',
    tools: ['semrush', 'ahrefs']
  },
  
  // 流量监控
  traffic: {
    source: 'plausible',
    metrics: ['pageviews', 'uniqueVisitors', 'bounceRate', 'avgDuration'],
    alerts: ['trafficDrop > 20%']
  },
  
  // 技术监控
  technical: {
    coreWebVitals: 'daily',
    mobileUsability: 'daily',
    structuredData: 'weekly',
    brokenLinks: 'weekly'
  },
  
  // AI 搜索监控
  aiSearch: {
    perplexity: {
      checkFrequency: 'weekly',
      querySamples: ['日本签证', '数字游民城市', '远程工作']
    },
    chatgpt: {
      checkFrequency: 'weekly',
      querySamples: ['日本签证好办吗', '中国护照免签国家']
    }
  }
};
```

### 12.7 自动化 SEO 工作流

```yaml
# .github/workflows/seo.yml
name: SEO Automation

on:
  schedule:
    - cron: '0 0 * * 0' # Weekly
  workflow_dispatch:

jobs:
  seo-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # 1. 检查索引状态
      - name: Check Google Index Status
        run: node scripts/seo/check-index.js
      
      # 2. 检查死链
      - name: Check Broken Links
        run: node scripts/seo/check-links.js
      
      # 3. 验证 Schema
      - name: Validate Structured Data
        run: node scripts/seo/validate-schema.js
      
      # 4. 检查 Core Web Vitals
      - name: Check Core Web Vitals
        run: node scripts/seo/check-cwv.js
      
      # 5. 生成 SEO 报告
      - name: Generate SEO Report
        run: node scripts/seo/generate-report.js
      
      # 6. 提交问题
      - name: Create Issues for Problems
        run: node scripts/seo/create-issues.js
```

---

## 13. 多语言 SEO (Hreflang)

### 13.1 语言版本策略

```html
<!-- 中文页 (默认) -->
<link rel="canonical" href="https://example.com/country/japan">
<link rel="alternate" hreflang="zh-CN" href="https://example.com/country/japan">
<link rel="alternate" hreflang="en" href="https://example.com/en/country/japan">
<link rel="alternate" hreflang="ja" href="https://example.com/ja/country/japan">
<link rel="alternate" hreflang="x-default" href="https://example.com/country/japan">

<!-- 英文页 -->
<link rel="canonical" href="https://example.com/en/country/japan">
<link rel="alternate" hreflang="zh-CN" href="https://example.com/country/japan">
<link rel="alternate" hreflang="en" href="https://example.com/en/country/japan">
<link rel="alternate" hreflang="ja" href="https://example.com/ja/country/japan">
<link rel="alternate" hreflang="x-default" href="https://example.com/country/japan">
```

### 13.2 Sitemap 多语言

```xml
<url>
  <loc>https://example.com/country/japan</loc>
  <xhtml:link rel="alternate" hreflang="zh-CN" href="https://example.com/country/japan"/>
  <xhtml:link rel="alternate" hreflang="en" href="https://example.com/en/country/japan"/>
  <xhtml:link rel="alternate" hreflang="ja" href="https://example.com/ja/country/japan"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/country/japan"/>
</url>
```

---

## 14. 核心 SEO 指标仪表板

| 指标 | 目标 | 当前 | 状态 |
|------|------|------|------|
| Google 索引页面 | 100,000 | 502 | ✅ |
| Bing 索引页面 | 100,000 | 502 | ✅ |
| 核心关键词排名 Top 3 | 50 | 待观察 | 🔄 |
| 核心关键词排名 Top 10 | 200 | 待观察 | 🔄 |
| 自然搜索流量/月 | 500,000 | 待观察 | 🔄 |
| 品牌搜索量 | 10,000 | 待观察 | 🔄 |
| Core Web Vitals (Good) | 95% | 待评估 | 🔄 |
| 移动可用性 | 100% | 待评估 | 🔄 |
| Schema 覆盖率 | 100% | 502/502 | ✅ |
| 内部链接/页 | 15+ | 待评估 | 🔄 |
| 页面加载时间 (LCP) | < 2.5s | 待评估 | 🔄 |
| 累积布局偏移 (CLS) | < 0.1 | 待评估 | 🔄 |

---

## 15. 实施路线图

| 阶段 | 时间 | 目标 | 交付物 |
|------|------|------|--------|
| **Phase 1** | 2026 Q1 | 基础 SEO | Meta 标签、Canonical、Schema (基础)、Sitemap、Robots ✅ |
| **Phase 2** | 2026 Q2 | 内容 SEO | Topic Clusters、内部链接、OG/Twitter Card、RSS ✅ |
| **Phase 3** | 2026 Q2 | 程序化 SEO | 502 页生成、自动化 Meta、模板系统 ✅ |
| **Phase 4** | 2026 Q3 | 扩展 | 多语言 SEO (hreflang 485 页)、英文详情页 182 个、数据质量修复 ✅ |
| **Phase 5** | 2026 Q4 | 规模 | 10,000 页、自动化监控、性能优化 |
| **Phase 6** | 2027 Q1 | 精细化 | 排名监控、A/B 测试、内容策略迭代 |

---

*SEO Architecture v3.0 | Global Mobility Infrastructure*
*Designed for: Google · Bing · Perplexity · ChatGPT Search · Gemini · Claude · AI Search*
