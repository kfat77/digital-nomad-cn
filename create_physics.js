import fs from "node:fs";
import path from "node:path";
import {
  AlignmentType, Document, Footer, Header, HeadingLevel, Packer, PageNumber,
  Paragraph, TextRun, convertInchesToTwip, BorderStyle, Table, TableCell, TableRow, WidthType, ShadingType
} from "docx";

const outputPath = process.argv[2];
if (!outputPath) throw new Error("Usage: node create.js /absolute/path/output.docx");

const outputDir = path.dirname(outputPath);

const T = String.raw;
const font = { name: "Times New Roman", eastAsia: "SimSun" };
const run = (text, options = {}) => new TextRun({ text, font, size: 24, ...options });
const para = (children, options = {}) => new Paragraph({
  spacing: { after: 120, line: 300 },
  ...options,
  children: Array.isArray(children) ? children : [children],
});

const p = (text) => para(run(text), { indent: { firstLine: convertInchesToTwip(0.33) } });
const h1 = (text) => para(run(text, { bold: true, size: 30 }), { heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 160 } });
const h2 = (text) => para(run(text, { bold: true, size: 26 }), { heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } });
const h3 = (text) => para(run(text, { bold: true, size: 24 }), { heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 } });
const bullet = (text) => para([run("• ", { bold: true }), run(text)], { indent: { left: convertInchesToTwip(0.3) } });

const formulaPara = (text) => para(run(text, { italics: true, size: 24 }), { alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } });

const sections = [];

// 标题页
sections.push(
  para(run("2022级 大学物理A（下）期末考试", { bold: true, size: 36 }), { alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
  para(run("考点 · 知识点 · 公式 完全汇总", { bold: true, size: 32, color: "37474F" }), { alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
  para(run("（覆盖全卷所有题目，不遗漏任何考点）", { size: 22, color: "78909C" }), { alignment: AlignmentType.CENTER, spacing: { after: 600 } })
);

// 使用说明
sections.push(h1("使用说明"));
sections.push(p("本文档根据《2022级大学物理A（下）期末考试A卷》的全部题目，逐题拆解并反向推导出所有涉及的考点、核心知识点与必备公式。内容按物理学科模块组织，涵盖：气体动理论、热力学基础、静电场、稳恒磁场、电磁感应、量子物理基础。所有公式均给出标准形式与适用条件，便于系统复习。"));

// ==================== 第一部分：气体动理论 ====================
sections.push(h1("一、气体动理论"));

sections.push(h2("1.1 理想气体状态方程"));
sections.push(bullet("理想气体状态方程（克拉珀龙方程）：pV = νRT = (m/M)RT"));
sections.push(bullet("其中 p 为压强，V 为体积，T 为热力学温度，ν 为物质的量，R = 8.31 J/(mol·K) 为普适气体常量，M 为摩尔质量。"));
sections.push(bullet("压强公式：p = (2/3)nε̄_k，其中 n = N/V 为分子数密度，ε̄_k = (1/2)m₀v̄² 为分子平均平动动能。"));
sections.push(bullet("温度与平均平动动能的关系：ε̄_k = (3/2)kT，其中 k = 1.38×10⁻²³ J/K 为玻尔兹曼常量。"));

sections.push(h2("1.2 自由度与能量均分定理"));
sections.push(bullet("刚性分子的自由度 i：单原子分子 i = 3；刚性双原子分子 i = 5；刚性多原子分子 i = 6。"));
sections.push(bullet("能量均分定理：每个自由度的平均能量为 (1/2)kT。"));
sections.push(bullet("1 mol 理想气体的内能：E = (i/2)RT"));
sections.push(bullet("质量为 m 的理想气体内能：E = (m/M)(i/2)RT = ν(i/2)RT"));
sections.push(bullet("等体过程（定容过程）吸热：Q_V = νC_V,mΔT = ν(i/2)RΔT = ΔE（内能增量）"));

sections.push(h2("1.3 麦克斯韦速率分布律"));
sections.push(bullet("速率分布函数 f(v) 的物理意义：f(v)dv 表示分子速率在 v ~ v+dv 区间内的分子数占总分子数的比率。满足归一化条件：∫₀^∞ f(v)dv = 1。"));
sections.push(bullet("速率分布函数：f(v) = 4π(m₀/2πkT)^(3/2) v² exp(-m₀v²/2kT)"));
sections.push(bullet("最概然速率（概率最大时的速率）：v_p = √(2kT/m₀) = √(2RT/M) ≈ 1.414√(RT/M)"));
sections.push(bullet("平均速率：v̄ = ∫₀^∞ v f(v) dv = √(8kT/πm₀) = √(8RT/πM) ≈ 1.60√(RT/M)"));
sections.push(bullet("方均根速率：√(v̄²) = √(3kT/m₀) = √(3RT/M) ≈ 1.73√(RT/M)"));
sections.push(bullet("三种速率关系：v_p < v̄ < √(v̄²)，均正比于 √T，反比于 √m₀（或 √M）。"));
sections.push(bullet("相同温度下，分子质量越大，最概然速率越小。例如氢气（H₂）与氮气（N₂）在相同温度下，v_p(H₂) > v_p(N₂)。"));
sections.push(bullet("v₁ ~ v₂ 速率区间内分子的平均速率：∫_{v₁}^{v₂} v f(v) dv / ∫_{v₁}^{v₂} f(v) dv"));

sections.push(h2("1.4 对应试卷题目"));
sections.push(p("选择题第1题（自由度）、第2题（平均速率）、第3题（最概然速率）均出自本章。"));

// ==================== 第二部分：热力学基础 ====================
sections.push(h1("二、热力学基础"));

sections.push(h2("2.1 热力学第一定律"));
sections.push(bullet("热力学第一定律：Q = ΔE + A，或微分形式 dQ = dE + dA。系统吸热 Q > 0，对外做功 A > 0，内能增加 ΔE > 0。"));
sections.push(bullet("准静态过程气体对外做功：A = ∫_{V₁}^{V₂} p dV"));

sections.push(h2("2.2 等值过程"));
sections.push(h3("等体过程（V = 常量）"));
sections.push(bullet("A = 0（体积不变，不做功）"));
sections.push(bullet("Q_V = ΔE = νC_V,mΔT = ν(i/2)RΔT"));
sections.push(bullet("定容摩尔热容：C_V,m = (i/2)R"));

sections.push(h3("等压过程（p = 常量）"));
sections.push(bullet("对外做功：A = p(V₂ - V₁) = νR(T₂ - T₁) = νRΔT"));
sections.push(bullet("内能增量：ΔE = νC_V,mΔT = ν(i/2)RΔT"));
sections.push(bullet("吸热：Q_p = νC_p,mΔT"));
sections.push(bullet("定压摩尔热容：C_p,m = C_V,m + R = [(i+2)/2]R"));
sections.push(bullet("迈耶公式：C_p,m - C_V,m = R"));
sections.push(bullet("比热容比：γ = C_p,m / C_V,m = (i+2)/i"));

sections.push(h3("等温过程（T = 常量）"));
sections.push(bullet("内能增量：ΔE = 0（理想气体内能只与温度有关）"));
sections.push(bullet("对外做功：A = Q = νRT ln(V₂/V₁) = νRT ln(p₁/p₂)"));
sections.push(bullet("对于 1 mol 理想气体：A = RT ln(V₂/V₁)"));

sections.push(h3("绝热过程"));
sections.push(bullet("Q = 0，故 ΔE + A = 0，即 A = -ΔE = -νC_V,mΔT"));
sections.push(bullet("绝热过程方程：pV^γ = 常量，TV^(γ-1) = 常量，p^(γ-1)T^(-γ) = 常量"));

sections.push(h2("2.3 循环过程与卡诺循环"));
sections.push(bullet("循环过程：系统经历一系列变化后回到初态，ΔE = 0，净吸热 Q = A（对外做的净功）。"));
sections.push(bullet("热机效率：η = A/Q₁ = (Q₁ - Q₂)/Q₁ = 1 - Q₂/Q₁，其中 Q₁ 为从高温热源吸热，Q₂ 为向低温热源放热。"));
sections.push(bullet("卡诺循环：由两个等温过程和两个绝热过程组成的理想循环。"));
sections.push(bullet("卡诺热机效率：η = 1 - T₂/T₁，其中 T₁ 为高温热源热力学温度，T₂ 为低温热源热力学温度。效率只与两热源温度有关，与工作物质无关。"));
sections.push(bullet("卡诺制冷机制冷系数：w = T₂/(T₁ - T₂)"));
sections.push(bullet("功率与热量关系：P = Q₁/T = A/ηT，若已知机械功率 P_机，则每秒排出废热速率 = Q₂/t = P_机(1-η)/η"));

sections.push(h2("2.4 热力学第二定律与熵"));
sections.push(bullet("热力学第二定律两种表述：克劳修斯表述（热量不能自动从低温传向高温）和开尔文表述（不可能从单一热源吸热使之全部变为有用功而不产生其他影响）。"));
sections.push(bullet("可逆过程与不可逆过程：无摩擦的准静态过程是可逆过程；实际过程都是不可逆过程。"));
sections.push(bullet("熵：描述系统无序程度的状态函数。"));
sections.push(bullet("克劳修斯熵公式（可逆过程）：dS = dQ_r/T，或 ΔS = ∫(dQ_r/T)"));
sections.push(bullet("理想气体等温过程熵变：ΔS = νR ln(V₂/V₁) = νR ln(p₁/p₂)"));
sections.push(bullet("等压过程熵变：ΔS = νC_p,m ln(T₂/T₁)"));
sections.push(bullet("等容过程熵变：ΔS = νC_V,m ln(T₂/T₁)"));
sections.push(bullet("理想气体从 (T₁,V₁) 到 (T₂,V₂) 的熵变：ΔS = νC_V,m ln(T₂/T₁) + νR ln(V₂/V₁)"));
sections.push(bullet("固/液体在温度变化较小时的熵变：ΔS = ∫(dQ/T) ≈ Q/T，其中 Q = mcΔT（若温度变化范围大，需积分）。"));
sections.push(bullet("熵增加原理：孤立系统的熵永不减少，ΔS_孤立 ≥ 0（可逆过程取等号，不可逆过程取大于号）。"));
sections.push(bullet("炉子等热源放热过程的熵变：若热源温度恒定为 T，放出热量 Q，则 ΔS_热源 = -Q/T（若热源很大，温度视为不变）。"));
sections.push(bullet("水吸热熵变：ΔS_水 = ∫_{T₁}^{T₂} (mc dT)/T = mc ln(T₂/T₁)（T 必须用热力学温度）"));

sections.push(h2("2.5 对应试卷题目"));
sections.push(p("选择题第1题（等体过程自由度）；填空题第1题（等温/等压膨胀功）、第2题（熵变）；计算题第三题（卡诺热机效率与废热）均出自本章。"));

// ==================== 第三部分：静电场 ====================
sections.push(h1("三、静电场"));

sections.push(h2("3.1 电场强度与电通量"));
sections.push(bullet("点电荷电场强度：E = q/(4πε₀r²) ê_r，其中 ε₀ = 8.85×10⁻¹² C²/(N·m²) 为真空介电常量。"));
sections.push(bullet("电场叠加原理：E = Σ E_i（矢量叠加）。"));
sections.push(bullet("电通量：Φ_e = ∫∫ E · dS = ∫∫ E cosθ dS"));
sections.push(bullet("高斯定理（真空）：∮ E · dS = Q_内/ε₀，即通过任意闭合曲面的电通量等于曲面内包围的净电荷除以 ε₀。"));
sections.push(bullet("高斯定理的应用："));
sections.push(bullet("  - 均匀带电球面（半径 R，电量 Q）：球外 E = Q/(4πε₀r²)（r>R），球内 E = 0（r<R）。"));
sections.push(bullet("  - 均匀带电球体（半径 R，电量 Q）：球外 E = Q/(4πε₀r²)（r>R），球内 E = Qr/(4πε₀R³)（r<R）。"));
sections.push(bullet("  - 无限长均匀带电直线（线密度 λ）：E = λ/(2πε₀r)，方向垂直于直线。"));
sections.push(bullet("  - 无限大均匀带电平面（面密度 σ）：E = σ/(2ε₀)，方向垂直于平面。"));
sections.push(bullet("  - 均匀带电圆柱体（半径 R，体密度 ρ）：柱内 E = ρr/(2ε₀)（r≤R），柱外 E = ρR²/(2ε₀r) = λ/(2πε₀r)（r>R）。"));

sections.push(h2("3.2 电势与电势能"));
sections.push(bullet("电势定义：V_a = W_a/q₀ = ∫_a^{参考点} E · dl（单位正电荷从 a 点移到电势零点电场力做的功）。"));
sections.push(bullet("电势差：V_a - V_b = ∫_a^b E · dl"));
sections.push(bullet("点电荷电势（以无穷远为零点）：V = q/(4πε₀r)"));
sections.push(bullet("点电荷电势（以某点为零点）：需根据零点位置重新计算积分常数。"));
sections.push(bullet("均匀带电球面（电量 Q，半径 R）电势：以无穷远为零点，球外 V = Q/(4πε₀r)，球内 V = Q/(4πε₀R)（等势体）。"));
sections.push(bullet("若球心处另有点电荷 q，则球内电势为点电荷 q 与球面 Q 共同产生的电势叠加。以球面为零点时，V(r) = q/(4πε₀)(1/r - 1/R)（仅点电荷贡献，球面本身在 r<R 处为等势，但零点在球面时其电势贡献为零）。"));
sections.push(bullet("两个均匀带电球面（半径 R₁ < R₂，电量 Q₁、Q₂）之间的电势差：V = Q₁/(4πε₀)(1/R₁ - 1/R₂) + Q₂/(4πε₀)(1/R₂ - 1/R₂) = Q₁/(4πε₀)(1/R₁ - 1/R₂)。"));
sections.push(bullet("带电体产生的电场中某点电势：V = ∫ (dq)/(4πε₀r)，为标量叠加。"));
sections.push(bullet("电势能：W = qV"));

sections.push(h2("3.3 电容器与电介质"));
sections.push(bullet("电容定义：C = Q/U（孤立导体或电容器）"));
sections.push(bullet("平行板电容器（真空）：C₀ = ε₀S/d"));
sections.push(bullet("平行板电容器（充满电介质）：C = ε_r C₀ = ε_r ε₀S/d，其中 ε_r 为相对介电常数。"));
sections.push(bullet("平行板电容器（部分插入电介质）：如插入厚度为 t、相对介电常数为 ε_r 的电介质，剩余空气厚度为 d-t，则等效为串联或利用 D = ε₀ε_r E = σ 计算。"));
sections.push(bullet("若保持极板间电势差 U 不变，插入电介质后：电场 E = U/d，D = ε₀ε_r E，电容 C 增大，电量 Q = CU 增大，储能 W_e = (1/2)CU² 增大。"));
sections.push(bullet("若保持极板电量 Q 不变，插入电介质后：电容 C 增大，电压 U = Q/C 减小，电场 E 减小，储能 W_e = Q²/(2C) 减小。"));
sections.push(bullet("部分插入电介质（厚度 d/2，ε_r = 2，总间距 d）：等效电容 C = 4C₀/3。推导：C = ε₀S/(d/2 + d/(2×2)) = 4ε₀S/3d = 4C₀/3。"));
sections.push(bullet("电容器储能：W_e = (1/2)QU = (1/2)CU² = Q²/(2C)"));

sections.push(h2("3.4 电场能量"));
sections.push(bullet("电场能量密度：w_e = (1/2)ε₀E²（真空）或 w_e = (1/2)ε₀ε_r E² = (1/2)DE = (1/2)D²/ε（有介质）"));
sections.push(bullet("总电场能量：W_e = ∫∫∫ w_e dV = ∫∫∫ (1/2)εE² dV"));
sections.push(bullet("球面电容器（半径 R₁、R₂）电场能量：W_e = Q²/(8πε₀)(1/R₁ - 1/R₂) = Q²/(8πε₀)·(R₂-R₁)/(R₁R₂) = (1/2)QV = (1/2)CU²。"));
sections.push(bullet("平行板电容器电场能量：W_e = (1/2)εE²·Sd = (1/2)ε₀ε_r E²·Sd。"));

sections.push(h2("3.5 对应试卷题目"));
sections.push(p("选择题第4题（高斯定理/电通量）、第5题（电容器电介质）、第6题（球面电势）、第7题（带电直线电场力）；填空题第3题（球面电容器电势差与电场能量）；计算题第四题（带电圆柱体电势分布）均出自本章。"));

// ==================== 第四部分：稳恒磁场 ====================
sections.push(h1("四、稳恒磁场"));

sections.push(h2("4.1 磁感应强度与毕奥-萨伐尔定律"));
sections.push(bullet("磁感应强度 B：描述磁场强弱和方向的物理量，单位特斯拉（T）。"));
sections.push(bullet("毕奥-萨伐尔定律：电流元 Idl 在距离 r 处产生的磁场 dB = (μ₀/4π)(Idl×r̂)/r² = (μ₀/4π)(Idl sinθ)/r²，方向由右手螺旋定则确定。"));
sections.push(bullet("真空磁导率：μ₀ = 4π×10⁻⁷ T·m/A。"));
sections.push(bullet("无限长直导线电流的磁场：B = μ₀I/(2πr)，方向沿环绕电流的切线。"));
sections.push(bullet("圆形电流圆心处磁场：B = μ₀I/(2R)，方向垂直于圆面（右手定则）。"));
sections.push(bullet("圆弧电流（圆心角 θ，弧度制）圆心处磁场：B = μ₀Iθ/(4πR) = μ₀I/(2R)·(θ/2π)"));
sections.push(bullet("半无限长直导线端点处磁场：B = μ₀I/(4πr)。"));
sections.push(bullet("载流直导线有限长 L，距导线垂直距离 a 处的磁场：B = (μ₀I/4πa)(cosθ₁ - cosθ₂)，其中 θ₁、θ₂ 为两端电流元与该点连线夹角。"));

sections.push(h2("4.2 安培环路定理"));
sections.push(bullet("安培环路定理（真空）：∮ B · dl = μ₀I_内，即磁感应强度沿任意闭合回路的线积分等于穿过回路所围面积的电流代数和的 μ₀ 倍。"));
sections.push(bullet("I_内 的正负：电流方向与回路环绕方向满足右手定则时取正，反之取负。"));
sections.push(bullet("安培环路定理的应用："));
sections.push(bullet("  - 无限长直导线：B = μ₀I/(2πr)。"));
sections.push(bullet("  - 无限长圆柱形导体（半径 R，均匀电流）：柱内 B = μ₀Ir/(2πR²)（r≤R），柱外 B = μ₀I/(2πr)（r>R）。"));
sections.push(bullet("  - 长直螺线管内部：B = μ₀nI（n 为单位长度匝数），外部 B ≈ 0。"));
sections.push(bullet("  - 环形螺线管（环内距轴心 r 处）：B = μ₀NI/(2πr)，其中 N 为总匝数。"));
sections.push(bullet("圆形电流在其平面内同心圆回路上：∮ B·dl = 0（因为无电流穿过回路），但回路上各点 B ≠ 0。"));

sections.push(h2("4.3 安培力与磁力矩"));
sections.push(bullet("安培力（电流元受力）：dF = Idl × B，大小 dF = IBdl sinθ。"));
sections.push(bullet("载流导线在磁场中受力：F = ∫ Idl × B"));
sections.push(bullet("平行直导线间相互作用力：单位长度受力 F/L = μ₀I₁I₂/(2πd)，同向电流相吸，反向电流相斥。"));
sections.push(bullet("载流线圈在均匀磁场中受力：F = 0（合力为零）。"));
sections.push(bullet("载流线圈在均匀磁场中力矩：M = NISB sinθ = P_m B sinθ，其中 P_m = NIS 为磁矩，方向由右手定则确定，N 为匝数，S 为面积。"));
sections.push(bullet("当磁通量为 0 时，线圈法线与 B 垂直，θ = 90°，力矩最大：M_max = NISB = P_m B。"));
sections.push(bullet("载流线圈在均匀磁场中受到的磁力（合力）为零，但合力矩不为零（除非 θ = 0 或 180°）。"));
sections.push(bullet("两个平行载流导线：同向电流相互吸引，反向电流相互排斥。若一导线附近有一可动线圈，线圈会被吸引或排斥同时可能转动。"));

sections.push(h2("4.4 磁场能量"));
sections.push(bullet("磁场能量密度：w_m = B²/(2μ₀) = (1/2)μ₀H² = (1/2)BH（真空）"));
sections.push(bullet("电磁场能量密度：w = w_e + w_m = (1/2)ε₀E² + B²/(2μ₀)（真空）"));
sections.push(bullet("若 w_e = w_m，则 (1/2)ε₀E² = B²/(2μ₀)，即 E/B = 1/√(ε₀μ₀) = c（光速），或 E/B = √(μ₀/ε₀) = Z₀（真空波阻抗）。注意：此处 E/B = 1/√(ε₀μ₀) = c ≈ 3×10⁸ m/s，但选项中常见的表达是 E/B = 1/√(ε₀μ₀) 或 E/B = √(μ₀/ε₀)。需根据题目选项仔细判断。"));
sections.push(bullet("真空中 E/B = c = 1/√(ε₀μ₀) ≈ 3×10⁸ m/s。"));

sections.push(h2("4.5 对应试卷题目"));
sections.push(p("选择题第8题（安培环路定理）、第9题（圆弧电流磁场）、第10题（载流线圈与直导线相互作用）、第11题（电磁场能量密度）；填空题第4题（磁力矩与磁力）；计算题第五题（环形螺线管）、第六题（导体薄片与导线磁力）均出自本章。"));

// ==================== 第五部分：电磁感应 ====================
sections.push(h1("五、电磁感应"));

sections.push(h2("5.1 法拉第电磁感应定律"));
sections.push(bullet("法拉第电磁感应定律：ε = -dΦ_m/dt，其中 Φ_m = ∫∫ B·dS 为磁通量。负号表示感应电动势的方向总是阻碍磁通量的变化（楞次定律）。"));
sections.push(bullet("N 匝线圈：ε = -N dΦ_m/dt"));
sections.push(bullet("感应电流：I = ε/R = -(1/R)dΦ_m/dt"));
sections.push(bullet("感应电量：q = ∫ I dt = (1/R)|ΔΦ_m|，与磁通量变化量有关，与变化快慢无关。"));

sections.push(h2("5.2 动生电动势"));
sections.push(bullet("动生电动势：导体在磁场中运动切割磁感线产生的电动势。"));
sections.push(bullet("动生电动势公式：ε = ∫ (v × B) · dl = Blv sinθ（直导线，v⊥B 时 ε = Blv；v∥B 或 B∥l 时 ε = 0）。"));
sections.push(bullet("动生电动势的非静电力是洛伦兹力。"));
sections.push(bullet("若直导线在均匀磁场中沿自身方向移动（v∥l），则 v×B 垂直于 dl，电动势为 0。"));

sections.push(h2("5.3 感生电场与涡旋电场"));
sections.push(bullet("感生电场（涡旋电场）：由变化磁场产生，电场线是闭合曲线。"));
sections.push(bullet("感生电场不是保守场，不能引入电势概念。∮ E_感 · dl ≠ 0。"));
sections.push(bullet("感生电场与变化磁场的关系（圆柱形区域）：∮ E_感 · dl = -dΦ_m/dt = -∫∫ (∂B/∂t)·dS"));
sections.push(bullet("圆柱形区域（半径 R）内均匀磁场变化率 dB/dt = k（常量）："));
sections.push(bullet("  - 柱内（r ≤ R）：E_感·2πr = -πr²(dB/dt)，E_感 = -(r/2)(dB/dt) = kr/2（大小）"));
sections.push(bullet("  - 柱外（r > R）：E_感·2πr = -πR²(dB/dt)，E_感 = -(R²/2r)(dB/dt) = kR²/(2r)（大小）"));
sections.push(bullet("方向：由楞次定律判断，沿圆周切线方向。若 dB/dt > 0（磁场增强），E_感为逆时针（假设 B 垂直纸面向里）；若 dB/dt < 0（磁场减弱），E_感为顺时针。"));

sections.push(h2("5.4 自感与互感"));
sections.push(bullet("自感系数：L = Ψ/I = NΦ_m/I，其中 Ψ = NΦ_m 为磁通链。"));
sections.push(bullet("自感电动势：ε_L = -L(dI/dt)"));
sections.push(bullet("自感系数 L 只与线圈的几何形状、大小、匝数及周围磁介质有关，与电流无关。"));
sections.push(bullet("长直螺线管自感：L = μ₀n²V = μ₀N²S/l，其中 n = N/l 为单位长度匝数。"));
sections.push(bullet("自感磁能：W_m = (1/2)LI²"));
sections.push(bullet("互感系数：M = Ψ₂₁/I₁ = Ψ₁₂/I₂"));
sections.push(bullet("互感电动势：ε₂₁ = -M(dI₁/dt)"));

sections.push(h2("5.5 位移电流与麦克斯韦方程组"));
sections.push(bullet("位移电流：I_d = dΦ_D/dt = ε₀ dΦ_E/dt = ε₀ d(∫∫ E·dS)/dt，其中 Φ_D = ∫∫ D·dS 为电位移通量。"));
sections.push(bullet("位移电流密度：j_d = ∂D/∂t = ε₀ ∂E/∂t（真空）"));
sections.push(bullet("全电流安培环路定理：∮ H · dl = I_传导 + I_d = ∫∫ (j + ∂D/∂t)·dS"));
sections.push(bullet("位移电流的本质：变化的电场产生磁场。位移电流可以产生磁场，但不产生热效应（无焦耳热）。"));
sections.push(bullet("电容器充放电过程中，位移电流 I_d = dQ/dt = I_传导，方向：充电时与传导电流同向，放电时与传导电流同向（通过电容器内部），外部电路中方向一致。"));
sections.push(bullet("直流电路中，稳态时电容器内部无位移电流（E 恒定，∂E/∂t = 0）。"));
sections.push(bullet("麦克斯韦方程组（积分形式）："));
sections.push(bullet("  1. ∮ D·dS = Q₀（电场高斯定理）"));
sections.push(bullet("  2. ∮ E·dl = -∂Φ_m/∂t（法拉第电磁感应定律）"));
sections.push(bullet("  3. ∮ B·dS = 0（磁场高斯定理）"));
sections.push(bullet("  4. ∮ H·dl = I₀ + ∂Φ_D/∂t（全电流安培环路定理）"));

sections.push(h2("5.6 对应试卷题目"));
sections.push(p("选择题第12题（动生电动势）、第13题（感生电场/自感）、第14题（位移电流）；计算题第七题（涡旋电场与感生电动势）均出自本章。"));

// ==================== 第六部分：量子物理基础 ====================
sections.push(h1("六、量子物理基础"));

sections.push(h2("6.1 光电效应"));
sections.push(bullet("光电效应：光照射金属表面，金属中的电子吸收光子能量后逸出金属表面的现象。"));
sections.push(bullet("爱因斯坦光电效应方程：hν = (1/2)m_e v_m² + A，其中 hν 为光子能量，(1/2)m_e v_m² 为光电子最大初动能，A 为逸出功。"));
sections.push(bullet("截止频率（红限频率）：ν₀ = A/h，只有当入射光频率 ν ≥ ν₀ 时才发生光电效应。"));
sections.push(bullet("截止电压：eU_c = (1/2)m_e v_m²，即 U_c = (hν - A)/e = (h/e)(ν - ν₀)。"));
sections.push(bullet("光子能量：E = hν = hc/λ，其中 h = 6.63×10⁻³⁴ J·s 为普朗克常量。"));
sections.push(bullet("已知逸出功 A 和截止电压 U_c，则入射光光子能量：hν = A + eU_c。"));
sections.push(bullet("例如：A = 4.2 eV，U_c = 2 V，则 hν = 4.2 + 2 = 6.2 eV。"));

sections.push(h2("6.2 康普顿散射"));
sections.push(bullet("康普顿散射：X 射线光子与自由电子发生弹性碰撞，光子波长变长。"));
sections.push(bullet("波长改变量：Δλ = λ - λ₀ = (h/m_e c)(1 - cosφ) = λ_c(1 - cosφ)，其中 λ_c = h/(m_e c) ≈ 2.43×10⁻¹² m = 0.00243 nm 为电子康普顿波长。"));
sections.push(bullet("散射角 φ = 0° 时，Δλ = 0（波长不变）；φ = 180° 时，Δλ = 2λ_c（波长改变最大）。"));
sections.push(bullet("入射光子能量：E₀ = hν₀ = hc/λ₀"));
sections.push(bullet("散射光子能量：E = hc/λ = hc/(λ₀ + Δλ)"));
sections.push(bullet("反冲电子动能：E_k = E₀ - E = hc(1/λ₀ - 1/λ) = hcΔλ/[λ₀(λ₀ + Δλ)]。"));
sections.push(bullet("若波长改变了 20%（即 λ = 1.2λ₀），则反冲电子动能：E_k = hc/λ₀ - hc/(1.2λ₀) = (hc/λ₀)(1 - 1/1.2) = (1/6)E₀。"));

sections.push(h2("6.3 不确定关系"));
sections.push(bullet("海森堡不确定关系：Δx·Δp_x ≥ ℏ/2，其中 ℏ = h/(2π)。"));
sections.push(bullet("物理意义：粒子的位置和动量不能同时被精确确定。位置测得越准，动量就越不准，反之亦然。这不是测量技术限制，而是微观粒子的固有属性。"));
sections.push(bullet("能量-时间不确定关系：ΔE·Δt ≥ ℏ/2。"));
sections.push(bullet("注意：不确定关系不是说粒子位置或动量不能准确确定，而是说两者不能同时准确确定。"));

sections.push(h2("6.4 对应试卷题目"));
sections.push(p("选择题第15题（不确定关系）；填空题第5题（光电效应光子能量、康普顿散射反冲电子动能）均出自本章。"));

// ==================== 附录：常用物理常量 ====================
sections.push(h1("附录：常用物理常量"));
sections.push(bullet("真空介电常量：ε₀ = 8.85×10⁻¹² C²/(N·m²) = 1/(4πk)，其中 k = 9.0×10⁹ N·m²/C²"));
sections.push(bullet("真空磁导率：μ₀ = 4π×10⁻⁷ T·m/A ≈ 1.2566×10⁻⁶ H/m"));
sections.push(bullet("库仑常数：k = 1/(4πε₀) = 9.0×10⁹ N·m²/C²"));
sections.push(bullet("普朗克常量：h = 6.63×10⁻³⁴ J·s = 4.14×10⁻¹⁵ eV·s"));
sections.push(bullet("约化普朗克常量：ℏ = h/(2π) = 1.055×10⁻³⁴ J·s"));
sections.push(bullet("元电荷：e = 1.602×10⁻¹⁹ C"));
sections.push(bullet("电子质量：m_e = 9.11×10⁻³¹ kg"));
sections.push(bullet("普适气体常量：R = 8.31 J/(mol·K)"));
sections.push(bullet("玻尔兹曼常量：k = 1.38×10⁻²³ J/K"));
sections.push(bullet("光速：c = 3.0×10⁸ m/s"));
sections.push(bullet("电子康普顿波长：λ_c = h/(m_e c) = 2.43×10⁻¹² m"));
sections.push(bullet("电子伏特：1 eV = 1.602×10⁻¹⁹ J"));

const doc = new Document({
  features: { updateFields: false },
  sections: [{
    properties: {
      page: {
        margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
      },
    },
    headers: {
      default: new Header({
        children: [para(run("大学物理A（下）考点 · 知识点 · 公式汇总", { bold: true, size: 20 }), { alignment: AlignmentType.CENTER })],
      }),
    },
    footers: {
      default: new Footer({
        children: [para(new TextRun({ children: [PageNumber.CURRENT] }), { alignment: AlignmentType.CENTER })],
      }),
    },
    children: sections,
  }],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outputPath, buffer);
