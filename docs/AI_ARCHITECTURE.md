# Global Mobility Infrastructure — AI Architecture v4.0
## 2028 Agent-Native Era

> **Last Updated**: 2028-01-15  
> **Status**: Production Ready  
> **Target**: LLM Agents, AI Assistants, Autonomous Planners, MCP Clients

---

## 1. 架构总览

```
┌──────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE LAYER                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Web App │  │ Mobile   │  │ Chatbot  │  │ API      │  │ MCP      │  │
│  │  (React) │  │ (Flutter)│  │ (Widget) │  │ (REST)   │  │ Server   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
└───────┼─────────────┼─────────────┼─────────────┼─────────────┼──────┘
        │             │             │             │             │
        └─────────────┴─────────────┴─────────────┴─────────────┘
                                    │
┌───────────────────────────────────▼──────────────────────────────────┐
│                      ORCHESTRATION LAYER                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Agent Router (意图识别 + 任务分发)                                │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │ Planner  │  │ Selector │  │ Advisor  │  │ Compare  │           │  │
│  │  │ Agent    │  │ Agent    │  │ Agent    │  │ Agent    │           │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘           │  │
│  │       └─────────────┴─────────────┴─────────────┘                │  │
│  │                         │                                        │  │
│  │  ┌──────────────────────▼──────────────────────┐                 │  │
│  │  │  Multi-Agent Collaboration Engine              │                 │  │
│  │  │  (共识决策、链式推理、并行调用)                  │                 │  │
│  │  └──────────────────────┬──────────────────────┘                 │  │
│  └─────────────────────────┼────────────────────────────────────────┘  │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────────────┐
│                      AI CORE LAYER                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  RAG Engine  │  │  LLM Core    │  │  Tool Use    │  │  Memory      │  │
│  │  (Retrieval) │  │  (Reasoning) │  │  (Execution) │  │  (Context)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │                 │          │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐  │
│  │  Vector DB   │  │  GPT-5       │  │  MCP         │  │  Short-term  │  │
│  │  (ChromaDB)  │  │  Claude 4    │  │  Registry    │  │  (Redis)     │  │
│  │  Hybrid      │  │  Gemini 2    │  │  Function    │  │  Long-term   │  │
│  │  Search      │  │  Local LLM   │  │  Calling     │  │  (PGVector)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────────────┐
│                      DATA LAYER                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Country  │  │ Visa     │  │ City     │  │ Cost     │  │ Tax      │  │
│  │ 195      │  │ 2,000+   │  │ 5,000+   │  │ 5,000+   │  │ 195      │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Job      │  │ Weather  │  │ Internet │  │ Health   │  │ Edu      │  │
│  │ 100K+    │  │ 5,000+   │  │ 195      │  │ 195      │  │ 195      │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ Flight   │  │ Passport │  │ Cowork   │  │ Article  │               │
│  │ 20K+     │  │ 199      │  │ 10K+     │  │ 500+     │               │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘               │
└──────────────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────────────┐
│                      EXTERNAL SERVICES                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 汇率API  │  │ 天气API  │  │ 航班API  │  │ 职位API  │  │ 政策API  │  │
│  │ 实时     │  │ 预报     │  │ Skyscan  │  │ RemoteOK │  │ 政府网站 │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. AI 功能矩阵

### 2.1 功能总览

| AI 功能 | 类型 | 输入 | 输出 | 核心能力 | 调用方式 |
|---------|------|------|------|----------|----------|
| **AI 选国家** | 推荐 | 用户画像 + 约束 | 排序国家列表 | 匹配算法 | API / Chat / MCP |
| **AI 选城市** | 推荐 | 国家 + 偏好 | 排序城市列表 | 多维度评分 | API / Chat / MCP |
| **AI 签证推荐** | 匹配 | 国籍 + 目的 + 条件 | 可申签证 + 成功率 | 规则引擎 + 模型 | API / Chat / MCP |
| **AI 税务咨询** | 问答 | 收入 + 国家 + 身份 | 税负估算 + 优化 | 计算引擎 + 知识 | API / Chat / MCP |
| **AI 成本比较** | 计算 | 多个城市 + 生活方式 | 月度预算对比 | 实时数据 + 计算 | API / Chat / MCP |
| **AI 生活规划** | 规划 | 时间 + 预算 + 目标 | 完整生活方案 | 路径规划 | API / Chat / MCP |
| **AI 职业规划** | 分析 | 技能 + 目标 + 市场 | 职业路径 + 机会 | 市场分析 + 匹配 | API / Chat / MCP |
| **AI 移民规划** | 路径 | 当前身份 + 目标 | 移民路径 + 时间线 | 路径搜索 + 优化 | API / Chat / MCP |

---

## 3. AI 选国家 (AI Country Selector)

### 3.1 功能设计

```typescript
interface CountrySelectorInput {
  // 用户画像
  passport: string;           // "CHN"
  age: number;                // 28
  income: {                   // 年收入
    amount: number;           // 80000
    currency: string;         // "USD"
    isRemote: boolean;        // true
  };
  skills: string[];           // ["frontend", "react", "typescript"]
  languages: {                // 语言能力
    code: string;             // "en"
    level: "basic" | "intermediate" | "advanced" | "native";
  }[];
  
  // 约束条件
  constraints: {
    budget: {                 // 预算
      monthly: number;       // 2500
      currency: string;       // "USD"
    };
    climate: string[];        // ["temperate", "subtropical"]
    visaPreference: string[]; // ["visa_free", "digital_nomad"]
    internetMin: number;      // 50 (Mbps)
    safetyMin: number;        // 70 (index)
    healthcare: "basic" | "good" | "excellent";
    maxDistanceFromHome?: number; // 飞行时间 (小时)
    politicalStability: "stable" | "moderate";
    hasCriminalRecord: boolean;   // false
  };
  
  // 偏好
  preferences: {
    priorities: string[];     // ["cost", "internet", "community"]
    lifestyle: string[];      // ["urban", "beach", "food"]
    mustHave: string[];       // ["coworking_spaces", "expat_community"]
    avoid: string[];          // ["cold_winter", "high_tax"]
    family: {
      hasChildren: boolean;   // false
      needsSchool: boolean;   // false
    };
    pets: boolean;            // false
  };
  
  // 时间
  plan: {
    duration: "short" | "medium" | "long" | "permanent";
    startDate: string;        // "2028-06-01"
  };
}

interface CountrySelectorOutput {
  recommendations: {
    rank: number;
    country: Country;
    score: number;            // 0-100
    matchReasons: string[];   // 为什么匹配
    concerns: string[];       // 需要注意的问题
    confidence: number;       // 0-1
    
    // 详细匹配数据
    breakdown: {
      visa: { score: number; reason: string };
      cost: { score: number; reason: string };
      internet: { score: number; reason: string };
      safety: { score: number; reason: string };
      community: { score: number; reason: string };
      climate: { score: number; reason: string };
      career: { score: number; reason: string };
    };
    
    // 推荐城市
    topCities: City[];
    
    // 推荐签证
    recommendedVisa: Visa | null;
    
    // 预估成本
    estimatedCost: {
      monthly: number;
      currency: string;
      breakdown: Record<string, number>;
    };
  }[];
  
  // 全局分析
  analysis: {
    totalConsidered: number;
    totalEliminated: number;
    eliminationReasons: Record<string, number>;
    marketTrend: string;      // 趋势分析
    alternatives: string[];   // 如果首选不可行的替代方案
  };
  
  // 对话式建议
  narrative: string;          // 自然语言解释
}
```

### 3.2 匹配算法

```python
# 国家匹配算法核心
class CountryMatcher:
    def __init__(self):
        self.weights = {
            'visa': 0.25,        # 签证可行性权重最高
            'cost': 0.20,        # 生活成本
            'internet': 0.15,    # 网络质量
            'safety': 0.10,      # 安全
            'community': 0.10,   # 社区
            'climate': 0.05,     # 气候
            'career': 0.10,      # 职业机会
            'healthcare': 0.05   # 医疗
        }
    
    def match(self, user_profile, countries):
        results = []
        
        for country in countries:
            # 1. 硬约束过滤
            if not self._pass_hard_constraints(user_profile, country):
                continue
            
            # 2. 多维度评分
            scores = self._calculate_scores(user_profile, country)
            
            # 3. 加权总分
            total_score = sum(
                scores[dim] * self.weights[dim] 
                for dim in self.weights
            )
            
            # 4. LLM 增强分析
            narrative = self._llm_enhance(user_profile, country, scores)
            
            results.append({
                'country': country,
                'score': total_score,
                'breakdown': scores,
                'narrative': narrative
            })
        
        # 5. 排序并返回 Top 10
        return sorted(results, key=lambda x: x['score'], reverse=True)[:10]
    
    def _pass_hard_constraints(self, user, country):
        # 签证：必须有一个可行路径
        feasible_visas = get_feasible_visas(user.passport, country.id, user)
        if not feasible_visas:
            return False
        
        # 预算：生活成本必须在预算内
        if country.cost_of_living_monthly > user.constraints.budget.monthly * 1.2:
            return False
        
        # 网络：必须满足最低网速
        if country.internet_speed_avg < user.constraints.internetMin:
            return False
        
        # 安全：必须满足最低安全指数
        if country.safety_index < user.constraints.safetyMin:
            return False
        
        # 政治稳定性
        if country.political_stability == "unstable" and user.constraints.politicalStability == "stable":
            return False
        
        return True
    
    def _calculate_scores(self, user, country):
        scores = {}
        
        # 签证分数 (0-100)
        scores['visa'] = self._score_visa(user, country)
        
        # 成本分数 (0-100)
        scores['cost'] = self._score_cost(user, country)
        
        # 网络分数 (0-100)
        scores['internet'] = self._score_internet(user, country)
        
        # 安全分数 (0-100)
        scores['safety'] = country.safety_index
        
        # 社区分数 (0-100)
        scores['community'] = self._score_community(user, country)
        
        # 气候分数 (0-100)
        scores['climate'] = self._score_climate(user, country)
        
        # 职业分数 (0-100)
        scores['career'] = self._score_career(user, country)
        
        # 医疗分数 (0-100)
        scores['healthcare'] = country.healthcare_index
        
        return scores
    
    def _llm_enhance(self, user, country, scores):
        # 使用 LLM 生成个性化分析
        prompt = f"""
        用户画像：{user.summary}
        国家：{country.name}
        评分：{scores}
        
        请用自然语言解释为什么这个国家适合/不适合该用户，
        包括具体建议和注意事项。150字以内。
        """
        return llm.generate(prompt)
```

### 3.3 对话式交互

```
User: 我想找适合数字游民的地方，预算每月2500美元，喜欢温暖的气候，中文护照

AI: 好的，让我分析一下...

[检索数据] → 筛选 195 个国家 → 计算匹配度 → 生成建议

AI: 根据您的条件，我推荐以下国家：

1. 🇹🇭 泰国 (匹配度: 94/100)
   - 免签60天，可延期
   - 月生活费约$1500-2000
   - 清迈/曼谷有活跃数字游民社区
   - 高速网络，大量共享办公空间
   - 温暖热带气候，美食丰富
   
   ⚠️ 注意：雨季(5-10月)可能影响户外活动

2. 🇵🇹 葡萄牙 (匹配度: 91/100)
   - D7数字游民签证，月收入达标即可
   - 月生活费约$2000-2500
   - 里斯本/波尔图有startup氛围
   - 欧盟标准，医疗体系完善
   - 地中海气候，夏季温暖
   
   ⚠️ 注意：需要证明月收入≥€3,280

3. 🇲🇽 墨西哥 (匹配度: 89/100)
   - 免签180天
   - 月生活费约$1200-1800
   - 普拉亚德尔卡曼/墨西哥城社区活跃
   - 时区与美国一致，适合远程工作
   - 温暖气候，丰富文化

[点击"详细分析"查看每个国家的完整规划]

User: 泰国怎么样？我需要详细方案

AI: 好的，我为您生成完整的泰国生活规划...

[调用 AI 生活规划功能]
```

---

## 4. AI 选城市 (AI City Selector)

### 4.1 功能设计

```typescript
interface CitySelectorInput {
  country: string;              // "thailand"
  
  // 详细偏好
  preferences: {
    vibe: string[];             // ["relaxed", "creative", "social"]
    workEnvironment: string[];  // ["coworking", "cafe", "home"]
    socialScene: string[];      // ["expat", "local", "mixed"]
    pace: "slow" | "moderate" | "fast";
    size: "small" | "medium" | "large" | "megacity";
    nature: string[];           // ["beach", "mountain", "urban"]
    
    // 工作相关
    timezoneCompatibility: string[]; // 需要匹配的时区
    coworkingBudget: number;        // 共享办公预算
    
    // 生活相关
    diet: string[];             // ["local", "international", "vegetarian"]
    fitness: string[];           // ["gym", "yoga", "running", "outdoor"]
    entertainment: string[];     // ["nightlife", "culture", "food"]
  };
  
  // 硬约束
  mustHave: {
    airport: boolean;           // 需要国际机场
    hospital: boolean;          // 需要国际医院
    school: boolean;            // 需要国际学校
    coworking: boolean;         // 需要共享办公
  };
}

interface CitySelectorOutput {
  recommendations: {
    rank: number;
    city: City;
    score: number;
    
    // 详细匹配分析
    matchAnalysis: {
      vibe: { match: number; description: string };
      work: { match: number; description: string };
      cost: { match: number; description: string };
      community: { match: number; description: string };
      lifestyle: { match: number; description: string };
    };
    
    // 具体推荐
    recommendations: {
      neighborhoods: string[];      // 推荐社区
      coworkingSpaces: string[];    // 推荐共享办公
      apartments: string[];         // 推荐公寓区域
      cafes: string[];              // 推荐咖啡馆
      gyms: string[];               // 推荐健身房
    };
    
    // 预估生活方案
    livingPlan: {
      accommodation: { type: string; cost: number; area: string };
      coworking: { name: string; cost: number };
      transport: { type: string; cost: number };
      food: { type: string; cost: number };
      totalMonthly: number;
    };
    
    // 3个月适应计划
    settlingPlan: string[];
  }[];
  
  // 城市对比 (如果用户要求)
  comparison?: CityComparison;
}
```

### 4.2 城市性格分析

```python
# 城市性格向量
class CityPersonality:
    """每个城市有独特的"性格"向量，用于匹配用户偏好"""
    
    def __init__(self, city):
        self.city = city
        self.vectors = {
            'pace': city.nomad_pace_score,           # 0=慢节奏, 100=快节奏
            'creativity': city.creative_scene_score,  # 创意氛围
            'social': city.social_scene_score,        # 社交氛围
            'professional': city.professional_score,  # 职业氛围
            'nature': city.nature_access_score,         # 自然接触
            'culture': city.cultural_depth_score,       # 文化深度
            'cost_efficiency': 100 - city.cost_index,   # 性价比
            'startup_energy': city.startup_ecosystem_score,
            'family_friendly': city.family_score,
            'lgbtq_friendly': city.lgbtq_score,
            'digital_nomad': city.nomad_hub_score
        }
    
    def match(self, user_preferences):
        """计算用户偏好与城市性格的匹配度"""
        user_vector = self._preference_to_vector(user_preferences)
        
        # 余弦相似度
        similarity = cosine_similarity(user_vector, self.vectors)
        
        # 硬约束检查
        if not self._check_hard_constraints(user_preferences):
            return 0
        
        return similarity * 100
```

---

## 5. AI 签证推荐 (AI Visa Recommender)

### 5.1 功能设计

```typescript
interface VisaRecommenderInput {
  // 身份
  passport: string;             // "CHN"
  currentResidency?: string;    // "CHN"
  currentVisa?: string;         // 当前持有的签证
  
  // 目的
  purpose: "tourism" | "work" | "study" | "digital_nomad" | 
           "investment" | "family" | "retirement" | "transit";
  
  // 个人条件
  profile: {
    age: number;
    income: {
      monthly: number;
      currency: string;
      source: "employment" | "freelance" | "investment" | "retirement" | "other";
    };
    education: "high_school" | "bachelor" | "master" | "phd";
    workExperience: number;     // 年
    profession: string;
    languageSkills: { code: string; level: string }[];
    familyStatus: "single" | "married" | "married_with_children";
    health: "good" | "fair" | "has_conditions";
    criminalRecord: boolean;
  };
  
  // 目标
  target: {
    country: string;            // 目标国家
    duration: number;           // 计划停留月数
    flexibility: "strict" | "flexible"; // 时间灵活度
  };
  
  // 优先
  priorities: string[];         // ["cost", "speed", "longevity", "path_to_permanent"]
}

interface VisaRecommenderOutput {
  // 可行性评估
  feasibility: {
    overall: "feasible" | "conditionally_feasible" | "not_feasible";
    confidence: number;           // 0-1
  };
  
  // 推荐签证列表
  recommendations: {
    rank: number;
    visa: Visa;
    
    // 匹配分析
    match: {
      score: number;              // 0-100
      meetsRequirements: {        // 逐项满足情况
        age: boolean;
        income: boolean;
        education: boolean;
        experience: boolean;
        language: boolean;
        health: boolean;
        criminal: boolean;
      };
      gaps: string[];             // 不满足的条件
      suggestions: string[];      // 弥补建议
    };
    
    // 成功概率
    successProbability: {
      overall: number;            // 0-1
      basedOn: string;            // 基于什么数据
      sampleSize: number;         // 样本量
    };
    
    // 详细方案
    plan: {
      timeline: {                 // 时间线
        phase: string;
        duration: string;
        action: string;
      }[];
      documents: {                // 材料清单
        name: string;
        required: boolean;
        original: boolean;
        copies: number;
        notarization: boolean;
        translation: boolean;
        status: "have" | "need_to_get" | "not_applicable";
      }[];
      costs: {                    // 费用明细
        item: string;
        amount: number;
        currency: string;
      }[];
      totalCost: {                // 总费用
        min: number;
        max: number;
        currency: string;
      };
    };
    
    // 替代路径
    alternatives: {
      ifThisFails: string;        // 如果失败怎么办
      relatedVisas: Visa[];      // 相关签证
    };
    
    // 风险提示
    risks: {
      level: "low" | "medium" | "high";
      description: string;
      mitigation: string;
    }[];
  }[];
  
  // 如果不可行：原因和建议
  ifNotFeasible: {
    reasons: string[];
    suggestions: string[];
    alternativeCountries: Country[];
  };
  
  // 自然语言解释
  narrative: string;
}
```

### 5.2 规则引擎 + LLM 混合架构

```python
class VisaRecommender:
    """
    签证推荐器：规则引擎确保准确性，LLM 提供解释和建议
    """
    
    def __init__(self):
        self.rule_engine = VisaRuleEngine()
        self.llm = LLMClient()
    
    def recommend(self, user_input):
        # 1. 规则引擎：硬约束筛选
        eligible_visas = self.rule_engine.filter_eligible(
            user_input.passport,
            user_input.target.country,
            user_input.purpose,
            user_input.profile
        )
        
        # 2. 规则引擎：逐项匹配
        scored_visas = []
        for visa in eligible_visas:
            match_result = self.rule_engine.match_requirements(visa, user_input.profile)
            
            # 计算成功概率
            success_rate = self._calculate_success_rate(visa, user_input)
            
            scored_visas.append({
                'visa': visa,
                'match': match_result,
                'success_rate': success_rate
            })
        
        # 3. LLM：生成个性化建议
        for item in scored_visas:
            item['narrative'] = self.llm.generate_advice(
                user_input, item['visa'], item['match']
            )
        
        # 4. 排序
        scored_visas.sort(key=lambda x: x['match']['score'], reverse=True)
        
        return scored_visas[:5]
    
    def _calculate_success_rate(self, visa, user_input):
        # 基于历史数据计算
        historical = get_historical_success(visa.id, user_input.passport)
        
        # 基于个人条件调整
        adjustments = self._calculate_adjustments(visa, user_input.profile)
        
        return min(0.99, historical.base_rate + adjustments)
```

---

## 6. AI 税务咨询 (AI Tax Advisor)

### 6.1 功能设计

```typescript
interface TaxAdvisorInput {
  // 个人情况
  citizenship: string;            // "CHN"
  taxResidency: string;         // 当前税收居民地
  
  // 收入结构
  income: {
    employment: {               // 工资收入
      amount: number;
      currency: string;
      sourceCountry: string;    // 收入来源于哪个国家
    };
    freelance?: {               // 自由职业收入
      amount: number;
      currency: string;
      clients: string[];        // 客户所在国家
    };
    investment?: {              // 投资收入
      dividends: number;
      capitalGains: number;
      interest: number;
    };
    rental?: {                  // 租金收入
      amount: number;
      propertyCountry: string;
    };
  };
  
  // 目标
  target: {
    moveTo: string;             // 计划移居的国家
    timeline: string;           // "2028-06-01"
    duration: "temporary" | "permanent";
  };
  
  // 其他
  hasProperties: boolean;       // 是否有多国房产
  hasInvestments: boolean;      // 是否有多国投资
  wantsOptimization: boolean;   // 是否需要税务优化
}

interface TaxAdvisorOutput {
  // 当前税负分析
  currentTax: {
    totalTaxable: number;
    totalTax: number;
    effectiveRate: number;
    breakdown: Record<string, number>;
  };
  
  // 移居后税负分析
  projectedTax: {
    totalTaxable: number;
    totalTax: number;
    effectiveRate: number;
    breakdown: Record<string, number>;
    savingsOrIncrease: number;
  };
  
  // 税务优化建议
  optimization: {
    recommendations: {
      strategy: string;
      description: string;
      potentialSavings: number;
      risk: "low" | "medium" | "high";
      legality: "legal" | "grey" | "requires_structure";
      implementation: string[];
    }[];
    
    // 最优方案
    optimalStructure: {
      residency: string;
      incomeRouting: string;
      estimatedSavings: number;
      compliance: string[];
    };
  };
  
  // 特殊考虑
  specialConsiderations: {
    crs: string;                  // CRS 影响
    exitTax: string;              // 离境税
    taxTreaties: string[];        // 税收协定
    doubleTaxation: string;       // 双重征税避免
  };
  
  // 计算详情
  calculations: {
    methodology: string;
    assumptions: string[];
    disclaimers: string[];
  };
  
  // 可视化数据
  charts: {
    currentVsProjected: ChartData;
    taxBreakdown: ChartData;
    optimizationImpact: ChartData;
  };
  
  narrative: string;              // 自然语言解释
}
```

### 6.2 税务计算引擎

```python
class TaxCalculator:
    """
    多国税制计算引擎
    """
    
    def calculate_tax(self, income, country, residency_status):
        tax_rules = load_tax_rules(country)
        
        # 1. 确定税收居民身份
        is_tax_resident = self._check_tax_residency(residency_status, country)
        
        # 2. 计算应税收入
        if is_tax_resident:
            taxable_income = income.total  # 全球收入
        else:
            taxable_income = income.from_country(country)  # 仅国内收入
        
        # 3. 应用税制
        if tax_rules.type == 'progressive':
            tax = self._calculate_progressive(taxable_income, tax_rules.brackets)
        elif tax_rules.type == 'flat':
            tax = taxable_income * tax_rules.rate
        
        # 4. 应用减免和扣除
        deductions = self._calculate_deductions(income, tax_rules)
        tax -= deductions
        
        # 5. 应用税收协定
        if income.source_country != country:
            tax = self._apply_tax_treaty(tax, income.source_country, country)
        
        return max(0, tax)
    
    def optimize(self, user_profile, target_countries):
        """税务优化建议"""
        scenarios = []
        
        for country in target_countries:
            # 方案1: 成为该国税收居民
            scenario1 = self._calculate_scenario(user_profile, country, 'resident')
            
            # 方案2: 非居民，但收入来源于该国
            scenario2 = self._calculate_scenario(user_profile, country, 'non_resident')
            
            # 方案3: 利用税收协定
            scenario3 = self._calculate_scenario_with_treaty(user_profile, country)
            
            scenarios.append({
                'country': country,
                'scenarios': [scenario1, scenario2, scenario3]
            })
        
        # 选择最优方案
        best = min(scenarios, key=lambda s: s['scenarios'][0]['total_tax'])
        return best
```

---

## 7. AI 成本比较 (AI Cost Comparison)

### 7.1 功能设计

```typescript
interface CostComparisonInput {
  cities: string[];             // ["tokyo", "bangkok", "lisbon"]
  lifestyle: "budget" | "moderate" | "luxury" | "custom";
  
  // 自定义生活方式（如果 lifestyle == "custom"）
  customProfile: {
    accommodation: {             // 住宿
      type: "studio" | "1br" | "2br" | "3br" | "shared" | "hotel";
      area: "city_center" | "suburbs" | "doesnt_matter";
    };
    dining: "cook_always" | "mostly_cook" | "mix" | "mostly_eat_out" | "always_eat_out";
    transport: "public" | "bike" | "mix" | "car" | "taxi";
    coworking: boolean;
    gym: boolean;
    entertainment: "minimal" | "moderate" | "high";
    travel: "none" | "monthly" | "weekly";
  };
  
  // 家庭
  family: {
    adults: number;
    children: number;
    childrenAges: number[];
    schoolType: "public" | "private" | "international" | "none";
    needsChildcare: boolean;
  };
  
  // 收入参考
  income: {
    amount: number;
    currency: string;
  };
}

interface CostComparisonOutput {
  // 每个城市的详细成本
  cities: {
    city: City;
    totalMonthly: number;
    currency: string;
    
    breakdown: {
      accommodation: { min: number; max: number; recommended: number };
      utilities: { internet: number; electricity: number; water: number; gas: number };
      food: { groceries: number; dining: number; delivery: number };
      transport: { public: number; taxi: number; gas: number; insurance: number };
      coworking: number;
      gym: number;
      entertainment: number;
      healthcare: { insurance: number; out_of_pocket: number };
      education: number;
      miscellaneous: number;
    };
    
    // 购买力分析
    purchasingPower: {
      localSalaryEquivalent: number;  // 当地同等薪资
      incomeRatio: number;             // 你的收入 / 当地平均
      comfortLevel: "struggling" | "comfortable" | "affluent";
      savingsPotential: number;          // 可储蓄金额
    };
    
    // 季节性变化
    seasonalVariation: {
      highSeason: number;              // 旺季加价
      lowSeason: number;             // 淡季折扣
    };
  }[];
  
  // 对比分析
  comparison: {
    cheapest: City;
    mostExpensive: City;
    bestValue: City;                   // 性价比最高
    
    // 详细对比表
    table: {
      category: string;
      [cityId: string]: number;
    }[];
    
    // 节省分析
    savings: {
      vsMostExpensive: number;
      vsHomeCountry: number;
    };
  };
  
  // 可视化数据
  charts: {
    monthlyBreakdown: ChartData;
    categoryComparison: ChartData;
    savingsPotential: ChartData;
  };
  
  // 自然语言解释
  narrative: string;
}
```

---

## 8. AI 生活规划 (AI Life Planner)

### 8.1 功能设计

```typescript
interface LifePlannerInput {
  // 当前状态
  current: {
    location: string;
    status: "employed" | "freelance" | "unemployed" | "student" | "retired";
    income: { amount: number; currency: string };
    savings: { amount: number; currency: string };
    obligations: string[];      // 现有义务（房贷、家庭等）
  };
  
  // 目标
  goals: {
    primary: "move_abroad" | "remote_work" | "retire_abroad" | "study_abroad" | "business_abroad";
    targetCountry?: string;     // 如果已确定
    targetDate: string;         // 目标日期
    duration: "1_year" | "3_years" | "5_years" | "permanent";
  };
  
  // 约束
  constraints: {
    budget: { initial: number; monthly: number; currency: string };
    timeline: "urgent" | "within_6_months" | "within_1_year" | "flexible";
    riskTolerance: "low" | "medium" | "high";
    familyConsiderations: string[];
  };
  
  // 偏好
  preferences: {
    climate: string[];
    culture: string[];
    language: string[];
    careerGoals: string[];
    lifestyle: string[];
  };
}

interface LifePlannerOutput {
  // 完整规划
  plan: {
    phase1_preparation: {
      duration: string;           // "3 months"
      tasks: {
        task: string;
        deadline: string;
        cost: number;
        dependencies: string[];
        resources: string[];
      }[];
    };
    
    phase2_transition: {
      duration: string;           // "1 month"
      tasks: {
        task: string;
        deadline: string;
        cost: number;
      }[];
    };
    
    phase3_settlement: {
      duration: string;           // "3 months"
      tasks: {
        task: string;
        deadline: string;
        cost: number;
      }[];
    };
    
    phase4_optimization: {
      duration: string;           // "ongoing"
      tasks: {
        task: string;
        frequency: string;
      }[];
    };
  };
  
  // 里程碑
  milestones: {
    date: string;
    event: string;
    prerequisites: string[];
  }[];
  
  // 预算计划
  budget: {
    initialCosts: {              // 初始成本
      item: string;
      cost: number;
      currency: string;
    }[];
    monthlyCosts: {              // 月度成本
      item: string;
      cost: number;
    }[];
    emergencyFund: number;
    totalFirstYear: number;
  };
  
  // 风险与应对
  risks: {
    risk: string;
    probability: "low" | "medium" | "high";
    impact: "low" | "medium" | "high";
    mitigation: string;
    contingencyPlan: string;
  }[];
  
  // 签证路径
  visaPath: {
    currentVisa: string;
    targetVisa: string;
    steps: {
      step: number;
      action: string;
      timeline: string;
      requirements: string[];
    }[];
    alternativePaths: string[];
  };
  
  // 职业路径
  careerPath: {
    currentSkills: string[];
    targetMarket: string;
    jobSearchStrategy: string;
    networkingPlan: string[];
    skillGaps: string[];
    upskillingPlan: string[];
  };
  
  // 社交融入
  integration: {
    communities: string[];
    events: string[];
    languageLearning: string;
    culturalTips: string[];
  };
  
  // 日历视图
  calendar: {
    date: string;
    event: string;
    category: "visa" | "housing" | "finance" | "career" | "social" | "health";
  }[];
  
  narrative: string;
}
```

### 8.2 路径规划算法

```python
class LifePlanner:
    """
    使用路径搜索算法生成最优生活规划
    """
    
    def plan(self, user_input):
        # 1. 确定目标状态
        goal_state = self._define_goal(user_input)
        
        # 2. 使用 A* 搜索最优路径
        path = self._astar_search(
            start=self._current_state(user_input),
            goal=goal_state,
            heuristic=self._heuristic
        )
        
        # 3. 分解为阶段
        phases = self._decompose_into_phases(path)
        
        # 4. 计算预算
        budget = self._calculate_budget(path, user_input)
        
        # 5. 识别风险
        risks = self._identify_risks(path, user_input)
        
        # 6. LLM 生成叙述
        narrative = self._generate_narrative(path, user_input)
        
        return {
            'phases': phases,
            'budget': budget,
            'risks': risks,
            'narrative': narrative
        }
    
    def _astar_search(self, start, goal, heuristic):
        """A* 路径搜索"""
        open_set = PriorityQueue()
        open_set.put((0, start))
        
        came_from = {}
        g_score = {start: 0}
        f_score = {start: heuristic(start, goal)}
        
        while not open_set.empty():
            current = open_set.get()[1]
            
            if self._is_goal(current, goal):
                return self._reconstruct_path(came_from, current)
            
            for neighbor in self._get_neighbors(current):
                tentative_g = g_score[current] + self._cost(current, neighbor)
                
                if tentative_g < g_score.get(neighbor, float('inf')):
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    f_score[neighbor] = tentative_g + heuristic(neighbor, goal)
                    open_set.put((f_score[neighbor], neighbor))
        
        return None  # 无路径
```

---

## 9. AI 职业规划 (AI Career Planner)

### 9.1 功能设计

```typescript
interface CareerPlannerInput {
  // 当前状态
  current: {
    skills: string[];           // ["react", "typescript", "node.js"]
    experience: number;         // 5 (年)
    currentRole: string;       // "Senior Frontend Engineer"
    currentSalary: { amount: number; currency: string };
    industry: string;           // "tech"
    companyType: "startup" | "small" | "medium" | "large" | "enterprise";
    remoteExperience: boolean;
    education: string;
  };
  
  // 目标
  goals: {
    targetRole: string;         // "Tech Lead" | "Product Manager" | "Freelancer"
    targetSalary: { amount: number; currency: string };
    timeline: string;           // "2 years"
    location: "remote" | "specific" | "flexible";
    specificLocation?: string;
  };
  
  // 约束
  constraints: {
    visaRestrictions: string[]; // 签证限制
    languageBarriers: string[];
    timezoneRestrictions: string[];
    willingnessToRelocate: boolean;
    familyConstraints: string[];
  };
  
  // 市场偏好
  market: {
    preferredRegions: string[];
    preferredCompanyTypes: string[];
    preferredIndustries: string[];
    avoid: string[];
  };
}

interface CareerPlannerOutput {
  // 技能分析
  skillAnalysis: {
    currentLevel: Record<string, "beginner" | "intermediate" | "advanced" | "expert">;
    marketDemand: Record<string, "low" | "medium" | "high" | "very_high">;
    skillGaps: {
      skill: string;
      importance: number;       // 0-1
      timeToLearn: string;      // "2 weeks"
      resources: string[];
    }[];
  };
  
  // 职业路径
  careerPaths: {
    path: string;
    steps: {
      step: number;
      title: string;
      timeline: string;
      requirements: string[];
      salaryRange: { min: number; max: number; currency: string };
      remoteOpportunities: number; // 远程职位数量
    }[];
    probability: number;          // 成功概率
    marketOutlook: string;
  }[];
  
  // 职位匹配
  jobMatches: {
    title: string;
    company: string;
    location: string;
    salary: { min: number; max: number; currency: string };
    matchScore: number;           // 0-100
    requiredSkills: string[];
    missingSkills: string[];
    applicationTips: string[];
    link: string;
  }[];
  
  // 薪资分析
  salaryAnalysis: {
    currentPercentile: number;  // 当前薪资百分位
    targetPercentile: number;
    byRegion: Record<string, { median: number; top10: number }>;
    byCompanySize: Record<string, number>;
    byRemoteType: Record<string, number>;
  };
  
  // 行动计划
  actionPlan: {
    immediate: string[];        // 立即行动
    shortTerm: string[];        // 3个月内
    mediumTerm: string[];       // 6个月内
    longTerm: string[];         // 1年内
  };
  
  narrative: string;
}
```

---

## 10. AI 移民规划 (AI Immigration Planner)

### 10.1 功能设计

```typescript
interface ImmigrationPlannerInput {
  // 当前身份
  current: {
    citizenship: string[];    // ["CHN"]
    currentResidency: string;   // "CHN"
    currentVisa: string;       // "none"
  };
  
  // 目标
  goal: {
    targetStatus: "permanent_resident" | "citizen" | "long_term_visa";
    targetCountry: string;       // "japan"
    timeline: "fast" | "standard" | "flexible";
  };
  
  // 个人条件
  profile: {
    age: number;
    education: string;
    profession: string;
    experience: number;
    income: { amount: number; currency: string };
    languageSkills: { code: string; level: string }[];
    family: {
      spouse: boolean;
      children: number;
      spouseEducation: string;
      spouseProfession: string;
    };
    netWorth: number;           // 净资产
    businessOwner: boolean;
  };
  
  // 偏好
  preferences: {
    investmentWilling: boolean; // 是否愿意投资
    investmentBudget: number;
    willingToStudy: boolean;    // 是否愿意先留学
    willingToWork: boolean;     // 是否愿意先工作
    willingToStartBusiness: boolean;
  };
}

interface ImmigrationPlannerOutput {
  // 可行路径
  viablePaths: {
    rank: number;
    name: string;               // "技术移民" | "投资移民" | "留学转移民"
    description: string;
    
    // 详细步骤
    steps: {
      phase: string;
      duration: string;       // "6-12 months"
      actions: string[];
      requirements: string[];
      costs: { item: string; amount: number; currency: string }[];
      documents: string[];
      successRate: number;
    }[];
    
    // 总时间线
    totalTimeline: {
      min: string;              // "2 years"
      max: string;              // "5 years"
    };
    
    // 总费用
    totalCost: {
      min: number;
      max: number;
      currency: string;
    };
    
    // 路径到最终目标
    pathToCitizenship: {
      current: string;
      steps: string[];
      final: string;
      totalYears: number;
    };
    
    // 风险评估
    riskAssessment: {
      level: "low" | "medium" | "high";
      factors: string[];
      mitigation: string[];
    };
  }[];
  
  // 最优路径
  recommendedPath: {
    name: string;
    reason: string;
    confidence: number;
  };
  
  // 关键里程碑
  milestones: {
    date: string;
    event: string;
    prerequisites: string[];
    deadline: string;
  }[];
  
  // 材料清单
  documentChecklist: {
    category: string;
    documents: {
      name: string;
      required: boolean;
      obtained: boolean;
      notes: string;
    }[];
  }[];
  
  // 费用明细
  costBreakdown: {
    phase: string;
    items: { name: string; cost: number; currency: string }[];
    subtotal: number;
  }[];
  
  // 备选方案
  alternatives: {
    ifThisPathFails: string;
    backupOptions: string[];
  };
  
  narrative: string;
}
```

### 10.2 路径搜索算法

```python
class ImmigrationPathFinder:
    """
    移民路径搜索：图遍历 + 约束满足
    """
    
    def find_paths(self, user_profile, target_country):
        # 1. 加载目标国家的所有移民路径
        all_paths = load_immigration_paths(target_country)
        
        # 2. 筛选用户满足条件的路径
        feasible_paths = []
        for path in all_paths:
            if self._check_eligibility(path, user_profile):
                feasible_paths.append(path)
        
        # 3. 对每条路径进行详细规划
        detailed_paths = []
        for path in feasible_paths:
            detailed = self._plan_path(path, user_profile)
            detailed_paths.append(detailed)
        
        # 4. 排序：时间、成本、成功率综合评分
        scored_paths = self._score_paths(detailed_paths, user_profile)
        
        return scored_paths
    
    def _check_eligibility(self, path, user_profile):
        # 检查用户是否满足路径的硬性要求
        requirements = path.requirements
        
        for req in requirements:
            if not self._satisfies(req, user_profile):
                return False
        
        return True
    
    def _score_paths(self, paths, user_profile):
        """
        综合评分：
        - 时间权重: 30%
        - 成本权重: 25%
        - 成功率权重: 30%
        - 用户偏好: 15%
        """
        for path in paths:
            time_score = self._score_time(path, user_profile)
            cost_score = self._score_cost(path, user_profile)
            success_score = path.success_rate * 100
            preference_score = self._score_preference(path, user_profile)
            
            path.total_score = (
                time_score * 0.30 +
                cost_score * 0.25 +
                success_score * 0.30 +
                preference_score * 0.15
            )
        
        return sorted(paths, key=lambda p: p.total_score, reverse=True)
```

---

## 11. RAG 架构设计 (Retrieval-Augmented Generation)

### 11.1 架构图

```
┌──────────────────────────────────────────────────────────────────────┐
│                        RAG PIPELINE                                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐          │
│  │   Query      │────→│  Query       │────→│  Hybrid      │          │
│  │   Input      │     │  Understanding│     │  Retrieval   │          │
│  └──────────────┘     └──────────────┘     └──────┬───────┘          │
│                                                      │                │
│  ┌──────────────────────────────────────────────────┐                │
│  │  Knowledge Base (Multi-Modal)                     │                │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │                │
│  │  │  Vector  │  │  Graph   │  │  Keyword │        │                │
│  │  │  Store   │  │  DB      │  │  Index   │        │                │
│  │  │(ChromaDB)│  │(Neo4j)   │  │(Elastic) │        │                │
│  │  └──────────┘  └──────────┘  └──────────┘        │                │
│  │                                                   │                │
│  │  Data Sources:                                    │                │
│  │  - 195 国家结构化数据                             │                │
│  │  - 2,000+ 签证文档                               │                │
│  │  - 500+ 文章和指南                                │                │
│  │  - 100,000+ 社区经验                             │                │
│  │  - 实时汇率、天气、航班                           │                │
│  └──────────────────────────────────────────────────┘                │
│                                                      │                │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐          │
│  │  Context     │←───→│  Re-Ranker  │←────│  Retrieved   │          │
│  │  Builder     │     │  (Cross-     │     │  Documents   │          │
│  │              │     │  Encoder)   │     │  (Top-K)     │          │
│  └──────┬───────┘     └──────────────┘     └──────────────┘          │
│         │                                                             │
│  ┌──────▼───────┐     ┌──────────────┐     ┌──────────────┐          │
│  │  Prompt      │────→│  LLM         │────→│  Response    │          │
│  │  Engineering │     │  Generation  │     │  (Grounded)  │          │
│  └──────────────┘     └──────────────┘     └──────────────┘          │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Grounding & Verification                                         │  │
│  │  - 来源标注 (Source Attribution)                                   │  │
│  │  - 事实核查 (Fact Verification)                                  │  │
│  │  - 时效性标注 (Freshness Indicator)                              │  │
│  │  - 置信度评分 (Confidence Score)                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### 11.2 数据索引策略

```python
# RAG 数据索引配置
RAG_INDEX_CONFIG = {
    # 1. 结构化数据 (JSON) → 向量 + 元数据
    'structured_data': {
        'entities': ['country', 'city', 'visa', 'tax', 'cost'],
        'indexing': {
            'vector': True,           # 语义搜索
            'metadata': True,         # 过滤
            'full_text': True         # 关键词搜索
        },
        'embedding_model': 'text-embedding-3-large',
        'chunk_size': 1000,          # 每个实体的完整 JSON
        'overlap': 0
    },
    
    # 2. 文档 (Markdown) → 分块 + 向量
    'documents': {
        'sources': ['articles', 'guides', 'faqs'],
        'chunking': {
            'strategy': 'semantic',   # 语义分块
            'chunk_size': 512,
            'overlap': 128
        },
        'embedding_model': 'text-embedding-3-large',
        'metadata_fields': ['title', 'author', 'date', 'category', 'tags', 'country']
    },
    
    # 3. 社区经验 (UGC) → 分块 + 向量 + 评分
    'community_experience': {
        'sources': ['visa_applications', 'city_reviews', 'job_experiences'],
        'chunking': {
            'strategy': 'paragraph',
            'chunk_size': 256,
            'overlap': 64
        },
        'metadata_fields': ['author', 'date', 'country', 'visa_type', 'success', 'verified'],
        'quality_filter': 'min_score_70'
    },
    
    # 4. 实时数据 → 缓存 + 刷新
    'realtime_data': {
        'sources': ['exchange_rates', 'weather', 'flight_prices', 'job_listings'],
        'refresh_interval': '1h',       # 1小时刷新
        'cache_strategy': 'redis',
        'indexing': 'metadata_only'   # 仅元数据，不嵌入
    },
    
    # 5. 知识图谱 (实体关系)
    'knowledge_graph': {
        'graph_db': 'neo4j',
        'entities': ['country', 'city', 'visa', 'person', 'company'],
        'relations': [
            'country-HAS_CITY->city',
            'country-OFFERS_VISA->visa',
            'visa-REQUIRES->document',
            'person-APPLIED_FOR->visa',
            'company-HAS_JOB->job'
        ]
    }
}
```

### 11.3 检索策略

```python
class HybridRetriever:
    """
    混合检索：语义 + 关键词 + 知识图谱
    """
    
    def retrieve(self, query, context, k=10):
        # 1. 查询理解
        query_analysis = self._analyze_query(query)
        # 识别意图、实体、约束
        
        # 2. 并行检索
        results = {}
        
        with ThreadPoolExecutor() as executor:
            # 语义检索
            future_semantic = executor.submit(
                self.vector_search, query, k=k*2
            )
            
            # 关键词检索
            future_keyword = executor.submit(
                self.keyword_search, query, k=k*2
            )
            
            # 知识图谱检索
            future_graph = executor.submit(
                self.graph_search, query_analysis.entities, k=k
            )
            
            # 结构化数据检索
            future_structured = executor.submit(
                self.structured_search, query_analysis, k=k
            )
            
            results['semantic'] = future_semantic.result()
            results['keyword'] = future_keyword.result()
            results['graph'] = future_graph.result()
            results['structured'] = future_structured.result()
        
        # 3. 融合排序 (RRF)
        fused = self._reciprocal_rank_fusion(results, k=k)
        
        # 4. 重排序 (Cross-Encoder)
        reranked = self._rerank(query, fused, k=k)
        
        # 5. 上下文构建
        context = self._build_context(query, reranked, max_tokens=4000)
        
        return context
    
    def _reciprocal_rank_fusion(self, results, k=60):
        """RRF: 融合多路召回结果"""
        scores = {}
        
        for source, docs in results.items():
            for rank, doc in enumerate(docs):
                doc_id = doc.id
                if doc_id not in scores:
                    scores[doc_id] = 0
                scores[doc_id] += 1 / (k + rank + 1)
        
        # 排序
        sorted_docs = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return [get_doc(id) for id, _ in sorted_docs]
    
    def _rerank(self, query, docs, k=10):
        """Cross-Encoder 重排序"""
        pairs = [(query, doc.content) for doc in docs]
        scores = self.cross_encoder.predict(pairs)
        
        for doc, score in zip(docs, scores):
            doc.rerank_score = score
        
        return sorted(docs, key=lambda d: d.rerank_score, reverse=True)[:k]
```

### 11.4 提示工程

```python
RAG_PROMPT_TEMPLATE = """
You are an expert global mobility advisor. Answer the user's question based on the provided context.

## Rules
1. ONLY use information from the provided context
2. If the context doesn't contain the answer, say "I don't have enough information about that"
3. Always cite your sources using [Source: title]
4. Indicate confidence level: High/Medium/Low
5. Include data freshness: "Data as of {date}"
6. For numerical data, show the exact number and source

## Context
{retrieved_context}

## User Question
{user_question}

## Answer Format
**Direct Answer**: [Concise answer]

**Detailed Explanation**: [Detailed explanation with citations]

**Sources**: 
- [Source 1] - [URL or document title]
- [Source 2] - [URL or document title]

**Confidence**: High/Medium/Low
**Data Freshness**: [Date]
**Disclaimer**: This information is for reference only. Please verify with official sources.
"""
```

---

## 12. Agent 架构设计 (Multi-Agent System)

### 12.1 Agent 系统架构

```
┌──────────────────────────────────────────────────────────────────────┐
│                     MULTI-AGENT SYSTEM                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Supervisor Agent (主管Agent)                                   │  │
│  │  - 意图识别                                                      │  │
│  │  - 任务分解                                                      │  │
│  │  - 结果整合                                                      │  │
│  │  - 质量控制                                                      │  │
│  └────────────────────────────┬───────────────────────────────────────┘  │
│                               │                                       │
│  ┌────────────────────────────▼───────────────────────────────────────┐  │
│  │  Specialized Agents (专业Agent)                                     │  │
│  │                                                                      │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │  │
│  │  │ Country    │  │ Visa       │  │ City       │  │ Tax        │   │  │
│  │  │ Agent      │  │ Agent      │  │ Agent      │  │ Agent      │   │  │
│  │  │            │  │            │  │            │  │            │   │  │
│  │  │ 能力:      │  │ 能力:      │  │ 能力:      │  │ 能力:      │   │  │
│  │  │ 国家数据   │  │ 签证匹配   │  │ 城市推荐   │  │ 税务计算   │   │  │
│  │  │ 政策分析   │  │ 材料审核   │  │ 社区评估   │  │ 优化建议   │   │  │
│  │  │ 趋势预测   │  │ 成功率预测 │  │ 成本估算   │  │ 合规检查   │   │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │  │
│  │                                                                      │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │  │
│  │  │ Career     │  │ Cost       │  │ Life       │  │ Immigration│   │  │
│  │  │ Agent      │  │ Agent      │  │ Planner    │  │ Agent      │   │  │
│  │  │            │  │            │  │            │  │            │   │  │
│  │  │ 能力:      │  │ 能力:      │  │ 能力:      │  │ 能力:      │   │  │
│  │  │ 技能分析   │  │ 成本计算   │  │ 路径规划   │  │ 路径搜索   │   │  │
│  │  │ 市场匹配   │  │ 预算优化   │  │ 里程碑设定 │  │ 条件检查   │   │  │
│  │  │ 薪资评估   │  │ 购买力分析 │  │ 风险识别   │  │ 时间线规划 │   │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │  │
│  │                                                                      │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                   │  │
│  │  │ Realtime   │  │ Language   │  │ Verification│                  │  │
│  │  │ Agent      │  │ Agent      │  │ Agent      │                   │  │
│  │  │            │  │            │  │            │                   │  │
│  │  │ 能力:      │  │ 能力:      │  │ 能力:      │                   │  │
│  │  │ 实时数据   │  │ 翻译       │  │ 事实核查   │                   │  │
│  │  │ 汇率/天气  │  │ 多语言     │  │ 来源验证   │                   │  │
│  │  │ 航班/职位  │  │ 文化适配   │  │ 时效检查   │                   │  │
│  │  └────────────┘  └────────────┘  └────────────┘                   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                               │                                       │
│  ┌────────────────────────────▼───────────────────────────────────────┐  │
│  │  Shared Memory (共享记忆)                                           │  │
│  │  - 用户画像                                                        │  │
│  │  - 对话历史                                                        │  │
│  │  - 已确认事实                                                      │  │
│  │  - 待澄清问题                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

### 12.2 Agent 协作协议

```typescript
interface AgentMessage {
  from: string;                 // 发送Agent ID
  to: string;                   // 接收Agent ID (或 "broadcast")
  type: "request" | "response" | "notification" | "clarification";
  
  // 任务
  task: {
    id: string;
    type: string;               // "analyze", "recommend", "calculate"
    params: Record<string, any>;
    priority: "high" | "medium" | "low";
    deadline: string;
  };
  
  // 上下文
  context: {
    userProfile: UserProfile;
    conversationHistory: Message[];
    sharedFacts: Fact[];
    pendingQuestions: Question[];
  };
  
  // 结果
  result?: {
    data: any;
    confidence: number;
    sources: Source[];
    caveats: string[];
  };
  
  // 元数据
  metadata: {
    timestamp: string;
    latency: number;            // 处理时间
    tokensUsed: number;
    modelVersion: string;
  };
}

// 协作模式
enum CollaborationMode {
  SEQUENTIAL = "sequential",   // 链式：Agent A → Agent B → Agent C
  PARALLEL = "parallel",         // 并行：Agent A, B, C 同时执行
  VOTING = "voting",             // 投票：多个Agent建议，主管决策
  DEBATE = "debate",             // 辩论：Agent A 支持，Agent B 反对
  HIERARCHICAL = "hierarchical" // 层级：主管分配，执行者汇报
}
```

### 12.3 对话式 Agent 示例

```
User: 我想在2028年移居日本，我28岁，前端工程师，年薪80k USD，
      有5年经验，会英语和基础日语，没有家属

Supervisor: 收到。这是一个综合规划请求，涉及国家选择、签证匹配、
           职业规划和财务规划。我将协调多个专家Agent为您服务。

[Supervisor 分解任务]

┌────────────────────────────────────────────────────────┐
│ 任务分解                                               │
├────────────────────────────────────────────────────────┤
│ 1. [Visa Agent]   检查日本签证可行性                    │
│ 2. [Career Agent] 分析日本前端工程师市场                 │
│ 3. [Cost Agent]   计算日本生活成本                       │
│ 4. [Tax Agent]    计算日本税负                           │
│ 5. [Life Planner] 生成完整移居计划                       │
└────────────────────────────────────────────────────────┘

[Parallel Execution]

Visa Agent: 分析中...
→ 结果：您符合日本技术人文知识国际业务签证条件
→ 需要：学士学位 + 5年经验 + 日本雇主offer
→ 或者：申请高度人才签证（打分制，您可能达到70分）

Career Agent: 分析中...
→ 结果：日本前端工程师平均年薪 600-800万日元
→ 热门公司：Mercari, PayPay, SmartNews, LINE
→ 技能需求：React, TypeScript, Next.js, 日语N2+

Cost Agent: 计算中...
→ 结果：东京月生活费约 25-35万日元
→ 房租：1K 8-12万，2LDK 15-20万
→ 总建议：年薪700万日元以上可舒适生活

Tax Agent: 计算中...
→ 结果：日本税负约 20-25%（住民税 + 所得税）
→ 与当前美国税负对比：略高 2-3%
→ 建议：利用日本的外国人税额控除制度

[Supervisor 整合结果]

Supervisor: 综合分析完成：

✅ 签证可行性：高度人才签证是最优路径
   - 您的条件预计得分：75-80分（70分达标）
   - 优势：快速获批（1-2个月），3年可申永住

✅ 职业市场：前景良好
   - 目标薪资：700-900万日元
   - 建议：提升日语至 N2，学习日本式开发流程

✅ 生活成本：可控
   - 建议居住区域：中野区、杉並区（性价比高）
   - 预估月支出：30万日元（含房租）

✅ 税务影响：轻微增加
   - 年收入税负增加约 $2,000-3,000
   - 但医疗保险覆盖更全面

📋 完整规划已生成：[查看详细计划]

下一步您想了解什么？
1. 高度人才签证申请流程
2. 日本求职策略
3. 具体预算规划
4. 其他国家的对比
```

---

## 13. MCP 设计 (Model Context Protocol)

### 13.1 MCP 服务端架构

```typescript
// MCP Server 定义
const server = new Server(
  {
    name: "global-mobility-mcp",
    version: "4.0.0",
  },
  {
    capabilities: {
      resources: {},    // 数据资源
      tools: {},        // 工具调用
      prompts: {},      // 提示模板
    },
  }
);

// ============ RESOURCES (数据资源) ============

// 资源：国家数据
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "data://country/all",
        name: "All Countries",
        mimeType: "application/json",
        description: "195 countries with complete data"
      },
      {
        uri: "data://country/{id}",
        name: "Country Detail",
        mimeType: "application/json",
        description: "Detailed data for a specific country"
      }
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  
  if (uri === "data://country/all") {
    return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(countries) }] };
  }
  
  if (uri.startsWith("data://country/")) {
    const id = uri.replace("data://country/", "");
    const country = await getCountry(id);
    return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(country) }] };
  }
});

// ============ TOOLS (工具) ============

// 工具1：签证匹配
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "match_visa",
        description: "Find suitable visas based on user profile",
        inputSchema: {
          type: "object",
          properties: {
            passport: { type: "string", description: "ISO 3166-1 alpha-2 country code" },
            target_country: { type: "string" },
            purpose: { type: "string", enum: ["tourism", "work", "study", "digital_nomad", "investment"] },
            income_usd: { type: "number" },
            age: { type: "number" },
            education: { type: "string", enum: ["high_school", "bachelor", "master", "phd"] },
            experience_years: { type: "number" }
          },
          required: ["passport", "target_country", "purpose"]
        }
      },
      
      // 工具2：生活成本计算
      {
        name: "calculate_cost",
        description: "Calculate cost of living for a city",
        inputSchema: {
          type: "object",
          properties: {
            city_id: { type: "string" },
            lifestyle: { type: "string", enum: ["budget", "moderate", "luxury"] },
            family_size: { type: "number" }
          },
          required: ["city_id"]
        }
      },
      
      // 工具3：税务计算
      {
        name: "calculate_tax",
        description: "Calculate tax burden for a country",
        inputSchema: {
          type: "object",
          properties: {
            country_id: { type: "string" },
            income: { type: "number" },
            income_currency: { type: "string" },
            residency_status: { type: "string", enum: ["resident", "non_resident"] }
          },
          required: ["country_id", "income"]
        }
      },
      
      // 工具4：国家推荐
      {
        name: "recommend_countries",
        description: "Recommend countries based on user preferences",
        inputSchema: {
          type: "object",
          properties: {
            passport: { type: "string" },
            budget_monthly_usd: { type: "number" },
            climate_preference: { type: "array", items: { type: "string" } },
            priorities: { type: "array", items: { type: "string" } },
            internet_min_mbps: { type: "number" },
            safety_min: { type: "number" }
          },
          required: ["passport", "budget_monthly_usd"]
        }
      },
      
      // 工具5：城市推荐
      {
        name: "recommend_cities",
        description: "Recommend cities within a country",
        inputSchema: {
          type: "object",
          properties: {
            country_id: { type: "string" },
            vibe: { type: "array", items: { type: "string" } },
            size: { type: "string", enum: ["small", "medium", "large", "megacity"] },
            coworking_required: { type: "boolean" }
          },
          required: ["country_id"]
        }
      },
      
      // 工具6：远程工作匹配
      {
        name: "match_remote_jobs",
        description: "Find remote jobs matching user skills",
        inputSchema: {
          type: "object",
          properties: {
            skills: { type: "array", items: { type: "string" } },
            experience_years: { type: "number" },
            preferred_regions: { type: "array", items: { type: "string" } },
            salary_min_usd: { type: "number" }
          },
          required: ["skills"]
        }
      },
      
      // 工具7：税务优化
      {
        name: "optimize_tax",
        description: "Suggest tax optimization strategies",
        inputSchema: {
          type: "object",
          properties: {
            citizenship: { type: "string" },
            current_residency: { type: "string" },
            target_residency: { type: "string" },
            income_sources: { type: "array", items: { type: "object" } },
            has_business: { type: "boolean" }
          },
          required: ["citizenship", "current_residency"]
        }
      },
      
      // 工具8：生活规划
      {
        name: "create_life_plan",
        description: "Create a comprehensive life plan for moving abroad",
        inputSchema: {
          type: "object",
          properties: {
            current_location: { type: "string" },
            target_location: { type: "string" },
            timeline: { type: "string" },
            budget: { type: "number" },
            family_size: { type: "number" }
          },
          required: ["current_location", "target_location"]
        }
      }
    ]
  };
});

// 工具调用处理
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case "match_visa":
      return await matchVisa(args);
    case "calculate_cost":
      return await calculateCost(args);
    case "calculate_tax":
      return await calculateTax(args);
    case "recommend_countries":
      return await recommendCountries(args);
    case "recommend_cities":
      return await recommendCities(args);
    case "match_remote_jobs":
      return await matchRemoteJobs(args);
    case "optimize_tax":
      return await optimizeTax(args);
    case "create_life_plan":
      return await createLifePlan(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// ============ PROMPTS (提示模板) ============

server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "visa_application_guide",
        description: "Generate a personalized visa application guide",
        arguments: [
          { name: "visa_id", description: "Visa type identifier", required: true },
          { name: "passport", description: "Passport country code", required: true }
        ]
      },
      {
        name: "country_comparison",
        description: "Compare two countries for digital nomads",
        arguments: [
          { name: "country_a", required: true },
          { name: "country_b", required: true }
        ]
      }
    ]
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === "visa_application_guide") {
    const visa = await getVisa(args.visa_id);
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please generate a personalized visa application guide for ${visa.name} for a ${args.passport} passport holder.`
          }
        }
      ]
    };
  }
});
```

### 13.2 MCP 客户端调用示例

```javascript
// Claude Desktop / Cursor / 其他 MCP 客户端配置
// mcp_config.json
{
  "mcpServers": {
    "global-mobility": {
      "command": "node",
      "args": ["/path/to/global-mobility-mcp/dist/index.js"],
      "env": {
        "API_KEY": "your-api-key",
        "DATA_PATH": "/path/to/data"
      }
    }
  }
}

// 使用示例（在 Claude 中）
// User: "帮我找适合我的签证"
// Claude 会自动调用 match_visa 工具
```

---

## 14. OpenAPI 设计 (REST API)

### 14.1 API 端点

```yaml
openapi: 3.1.0
info:
  title: Global Mobility Infrastructure API
  version: 4.0.0
  description: AI-powered global mobility data and planning API

servers:
  - url: https://api.globalmobility.io/v4

paths:
  # ============ AI 功能端点 ============
  
  /ai/countries/recommend:
    post:
      summary: AI 推荐国家
      operationId: recommendCountries
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                passport: { type: string, example: "CHN" }
                budget_monthly_usd: { type: number, example: 2500 }
                climate_preference: { type: array, items: { type: string } }
                priorities: { type: array, items: { type: string } }
                internet_min_mbps: { type: number, default: 50 }
                safety_min: { type: number, default: 70 }
              required: [passport, budget_monthly_usd]
      responses:
        200:
          description: 推荐国家列表
          content:
            application/json:
              schema:
                type: object
                properties:
                  recommendations:
                    type: array
                    items:
                      type: object
                      properties:
                        rank: { type: integer }
                        country_id: { type: string }
                        country_name: { type: string }
                        score: { type: number }
                        match_reasons: { type: array, items: { type: string } }
                        concerns: { type: array, items: { type: string } }
                        confidence: { type: number }
                        estimated_cost_monthly:
                          type: object
                          properties:
                            min: { type: number }
                            max: { type: number }
                            currency: { type: string }
                  analysis:
                    type: object
                    properties:
                      total_considered: { type: integer }
                      total_eliminated: { type: integer }
                      market_trend: { type: string }
                  narrative: { type: string }

  /ai/cities/recommend:
    post:
      summary: AI 推荐城市
      operationId: recommendCities
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                country_id: { type: string }
                preferences:
                  type: object
                  properties:
                    vibe: { type: array, items: { type: string } }
                    size: { type: string, enum: [small, medium, large, megacity] }
                    coworking_required: { type: boolean }
                must_have:
                  type: object
                  properties:
                    airport: { type: boolean }
                    hospital: { type: boolean }
      responses:
        200:
          description: 推荐城市列表

  /ai/visas/match:
    post:
      summary: AI 签证匹配
      operationId: matchVisa
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                passport: { type: string }
                target_country: { type: string }
                purpose: { type: string }
                profile:
                  type: object
                  properties:
                    age: { type: integer }
                    income: { type: object, properties: { monthly: { type: number }, currency: { type: string } } }
                    education: { type: string }
                    experience_years: { type: number }
                    profession: { type: string }
              required: [passport, target_country, purpose]
      responses:
        200:
          description: 匹配签证列表
          content:
            application/json:
              schema:
                type: object
                properties:
                  feasibility:
                    type: object
                    properties:
                      overall: { type: string, enum: [feasible, conditionally_feasible, not_feasible] }
                      confidence: { type: number }
                  recommendations:
                    type: array
                    items:
                      type: object
                      properties:
                        visa: { $ref: "#/components/schemas/Visa" }
                        match:
                          type: object
                          properties:
                            score: { type: number }
                            meets_requirements: { type: object }
                            gaps: { type: array, items: { type: string } }
                        success_probability:
                          type: object
                          properties:
                            overall: { type: number }
                            sample_size: { type: integer }
                        plan:
                          type: object
                          properties:
                            timeline: { type: array }
                            documents: { type: array }
                            costs: { type: array }
                        risks:
                          type: array
                          items:
                            type: object
                            properties:
                              level: { type: string }
                              description: { type: string }
                              mitigation: { type: string }

  /ai/tax/calculate:
    post:
      summary: AI 税务计算
      operationId: calculateTax
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                citizenship: { type: string }
                current_residency: { type: string }
                target_residency: { type: string }
                income:
                  type: object
                  properties:
                    employment: { type: object }
                    freelance: { type: object }
                    investment: { type: object }
      responses:
        200:
          description: 税务计算结果

  /ai/cost/compare:
    post:
      summary: AI 成本比较
      operationId: compareCost
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                cities: { type: array, items: { type: string } }
                lifestyle: { type: string, enum: [budget, moderate, luxury, custom] }
                family:
                  type: object
                  properties:
                    adults: { type: integer }
                    children: { type: integer }
      responses:
        200:
          description: 成本比较结果

  /ai/career/plan:
    post:
      summary: AI 职业规划
      operationId: planCareer
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                current:
                  type: object
                  properties:
                    skills: { type: array, items: { type: string } }
                    experience: { type: integer }
                    current_role: { type: string }
                    current_salary: { type: object }
                goals:
                  type: object
                  properties:
                    target_role: { type: string }
                    target_location: { type: string }
                    timeline: { type: string }
      responses:
        200:
          description: 职业规划方案

  /ai/life/plan:
    post:
      summary: AI 生活规划
      operationId: planLife
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                current:
                  type: object
                  properties:
                    location: { type: string }
                    status: { type: string }
                    income: { type: object }
                    savings: { type: object }
                goals:
                  type: object
                  properties:
                    primary: { type: string }
                    target_date: { type: string }
                    duration: { type: string }
      responses:
        200:
          description: 完整生活规划

  /ai/immigration/plan:
    post:
      summary: AI 移民规划
      operationId: planImmigration
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                current:
                  type: object
                  properties:
                    citizenship: { type: array, items: { type: string } }
                    current_residency: { type: string }
                goal:
                  type: object
                  properties:
                    target_status: { type: string }
                    target_country: { type: string }
                profile:
                  type: object
                  properties:
                    age: { type: integer }
                    education: { type: string }
                    profession: { type: string }
                    income: { type: object }
                    net_worth: { type: number }
      responses:
        200:
          description: 移民路径规划

  # ============ 数据查询端点 ============
  
  /countries:
    get:
      summary: 获取所有国家
      parameters:
        - name: filter
          in: query
          schema: { type: string }
        - name: sort
          in: query
          schema: { type: string }
        - name: limit
          in: query
          schema: { type: integer, default: 50 }
      responses:
        200:
          description: 国家列表

  /countries/{id}:
    get:
      summary: 获取国家详情
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        200:
          description: 国家详情

  /cities:
    get:
      summary: 获取所有城市
      parameters:
        - name: country_id
          in: query
          schema: { type: string }
      responses:
        200:
          description: 城市列表

  /cities/{id}:
    get:
      summary: 获取城市详情
      responses:
        200:
          description: 城市详情

  /visas:
    get:
      summary: 获取所有签证
      parameters:
        - name: country_id
          in: query
          schema: { type: string }
        - name: passport
          in: query
          schema: { type: string }
      responses:
        200:
          description: 签证列表

  /visas/{id}:
    get:
      summary: 获取签证详情
      responses:
        200:
          description: 签证详情

  /remote-jobs:
    get:
      summary: 获取远程工作
      parameters:
        - name: skills
          in: query
          schema: { type: array, items: { type: string } }
        - name: salary_min
          in: query
          schema: { type: integer }
      responses:
        200:
          description: 远程工作列表

  /search:
    post:
      summary: 全文搜索
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                query: { type: string }
                filters:
                  type: object
                  properties:
                    type: { type: array, items: { type: string } }
                    countries: { type: array, items: { type: string } }
                limit: { type: integer, default: 20 }
      responses:
        200:
          description: 搜索结果

components:
  schemas:
    Country:
      type: object
      properties:
        id: { type: string }
        name: { type: string }
        name_en: { type: string }
        code: { type: string }
        population: { type: integer }
        gdp_per_capita: { type: number }
        cost_of_living_index: { type: number }
        safety_index: { type: number }
        digital_nomad_score: { type: number }
    
    Visa:
      type: object
      properties:
        id: { type: string }
        name: { type: string }
        country_id: { type: string }
        type: { type: string }
        max_stay_days: { type: integer }
        processing_time_days: { type: integer }
        fee_usd: { type: number }
        requirements: { type: array, items: { type: string } }
```

### 14.2 API 认证

```yaml
# 安全方案
security:
  - ApiKeyAuth: []
  - BearerAuth: []

components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

---

## 15. 技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| **LLM** | GPT-5 / Claude 4 / Gemini 2 | 主推理引擎 |
| **Embedding** | text-embedding-3-large | 文本嵌入 |
| **Vector DB** | ChromaDB / PGVector | 向量存储 |
| **Graph DB** | Neo4j | 知识图谱 |
| **Keyword Search** | Elasticsearch | 全文检索 |
| **Cache** | Redis | 实时数据缓存 |
| **API** | FastAPI + OpenAPI 3.1 | REST API |
| **MCP** | @modelcontextprotocol/sdk | Model Context Protocol |
| **Re-ranking** | Cross-Encoder | 结果重排序 |
| **Orchestration** | LangChain / LangGraph | Agent 编排 |
| **Monitoring** | LangSmith | LLM 调用追踪 |
| **Deployment** | Docker + K8s | 容器化部署 |

---

## 16. 性能指标

| 指标 | 目标 | 说明 |
|------|------|------|
| 检索延迟 | < 200ms | 混合检索 + 重排序 |
| LLM 生成延迟 | < 2s | 首 token 返回 |
| 端到端延迟 | < 3s | 用户问题 → 完整回答 |
| 吞吐量 | 1000 RPM | 每分钟请求数 |
| 准确率 | > 90% | 事实准确性 |
| 相关性 | > 85% | 检索相关性 |
| 用户满意度 | > 4.5/5 | 对话满意度 |

---

*AI Architecture v4.0 | Global Mobility Infrastructure*
*Designed for: LLM Agents · AI Assistants · Autonomous Planners · MCP Clients*
