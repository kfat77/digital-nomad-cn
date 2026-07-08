import fs from "node:fs";
import path from "node:path";
import {
  AlignmentType,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImportedXmlComponent,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  convertInchesToTwip,
} from "docx";

const outputPath = process.argv[2];
if (!outputPath) {
  throw new Error("Usage: node create.js /absolute/path/output.docx");
}

const T = String.raw;

const palette = {
  dark: "263238",
  primary: "37474F",
  light: "78909C",
  border: "D8E0E3",
  fill: "EEF3F6",
  accent: "1565C0",
};

const font = { name: "Times New Roman", eastAsia: "SimSun" };
const mathFont = { name: "Cambria Math", eastAsia: "SimSun" };
const codeFont = { name: "Consolas", eastAsia: "SimSun" };

const run = (text, options = {}) =>
  new TextRun({ text, font, size: 22, ...options });

const mathRun = (text, options = {}) =>
  new TextRun({ text, font: mathFont, size: 22, ...options });

const para = (children, options = {}) =>
  new Paragraph({
    spacing: { after: 120, line: 280 },
    ...options,
    children: Array.isArray(children) ? children : [children],
  });

const bodyPara = (text, options = {}) =>
  para(run(text), {
    indent: { firstLine: convertInchesToTwip(0.33) },
    ...options,
  });

const heading = (text, level = 1) =>
  para(run(text, { bold: true, size: level === 1 ? 30 : level === 2 ? 26 : 24, color: palette.dark }), {
    heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
  });

const formulaPara = (text, options = {}) =>
  para(mathRun(text, { italics: true }), {
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
    ...options,
  });

const notePara = (text, options = {}) =>
  para(run(text, { italics: true, color: palette.light, size: 20 }), {
    indent: { left: convertInchesToTwip(0.3) },
    spacing: { before: 60, after: 60 },
    ...options,
  });

const cell = (text, options = {}) =>
  new TableCell({
    children: [para(run(text, { size: 20 }), { spacing: { after: 60, line: 240 } })],
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    ...options,
  });

const cellMath = (text, options = {}) =>
  new TableCell({
    children: [para(mathRun(text, { size: 20 }), { spacing: { after: 60, line: 240 } })],
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    ...options,
  });

const xmlEscape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const toc = (entries) => {
  const cached = entries
    .map(({ title: entryTitle, level, page }) => {
      const indent = Math.max(0, level - 1) * 360;
      return `<w:p>
        <w:pPr>
          <w:pStyle w:val="TOC${level}"/>
          <w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9000"/></w:tabs>
          <w:ind w:left="${indent}"/>
        </w:pPr>
        <w:r><w:t>${xmlEscape(entryTitle)}</w:t></w:r>
        <w:r><w:tab/></w:r>
        <w:r><w:t>${xmlEscape(page)}</w:t></w:r>
      </w:p>`;
    })
    .join("");

  return ImportedXmlComponent.fromXmlString(`<w:sdt xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:sdtPr><w:alias w:val="目录"/></w:sdtPr>
    <w:sdtContent>
      <w:p>
        <w:r>
          <w:fldChar w:fldCharType="begin" w:dirty="true"/>
          <w:instrText xml:space="preserve"> TOC \\o &quot;1-3&quot; \\h \\z \\u </w:instrText>
          <w:fldChar w:fldCharType="separate"/>
        </w:r>
      </w:p>
      ${cached}
      <w:p><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>
    </w:sdtContent>
  </w:sdt>`).root[0];
};

const children = [];

// Title
const docTitle = T`大学物理（下）期末复习提纲`;
children.push(
  para(run(docTitle, { bold: true, size: 36, color: palette.dark }), {
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    spacing: { after: 360 },
  }),
  para(run(T`本提纲涵盖全部考试公式与知识点，无删减。`, { italics: true, color: palette.light, size: 20 }), {
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
  })
);

// TOC

const tocEntries = [];

// ==================== Helper to add section ====================
const addSection = (title, level, page, contentFn) => {
  tocEntries.push({ title, level, page });
  children.push(heading(title, level));
  if (contentFn) contentFn();
};

// ==================== 第8章 气体动理论 ====================
addSection(T`第8章 气体动理论`, 1, 1, () => {
  children.push(heading(T`一、理想气体状态方程`, 2));
  formulaPara(T`pV = (m/M)RT = νRT = NkT`);
  bodyPara(T`变形：p = nkT，其中 n = N/V 为分子数密度。摩尔数 ν = m/M = N/NA。`);

  children.push(heading(T`二、压强公式与温度公式`, 2));
  formulaPara(T`p = (2/3)nε̄t = (1/3)nm v²̄`);
  formulaPara(T`ε̄t = (1/2)m v²̄ = (3/2)kT`);
  notePara(T`本质：温度是分子平均平动动能的量度。`);

  children.push(heading(T`三、理想气体的能量`, 2));
  children.push(heading(T`1. 一个分子的能量`, 3));
  bodyPara(T`平均平动动能：ε̄t = (3/2)kT`);
  bodyPara(T`平均转动动能：ε̄r = (r/2)kT（r 为转动自由度）`);
  bodyPara(T`平均动能：ε̄k = (i/2)kT（i = t + r + s 为总自由度）`);
  notePara(T`自由度速查：单原子 i = 3（仅平动）；刚性双原子 i = 5（3平动+2转动）；刚性多原子 i = 6（3平动+3转动）。`);

  children.push(heading(T`2. 理想气体内能`, 3));
  formulaPara(T`E = (m/M)·(i/2)RT = ν(i/2)RT`);
  bodyPara(T`单位体积内能：E/V = (i/2)nkT = (i/2)p`);
  bodyPara(T`单位质量内能：E/m = (i/2)(RT/M)`);

  children.push(heading(T`四、三种速率`, 2));
  formulaPara(T`vp = √(2kT/m) = √(2RT/M) ≈ 1.41√(RT/M)`);
  formulaPara(T`v̄ = √(8kT/πm) = √(8RT/πM) ≈ 1.60√(RT/M)`);
  formulaPara(T`√(v²̄) = √(3kT/m) = √(3RT/M) ≈ 1.73√(RT/M)`);
  notePara(T`关系：vp < v̄ < √(v²̄)。最概然速率最常用于判断气体种类和温度关系。`);

  children.push(heading(T`五、速率分布函数 f(v)`, 2));
  formulaPara(T`f(v) = (1/N)(dN/dv)`);
  bodyPara(T`归一化条件：∫₀^∞ f(v) dv = 1`);
  bodyPara(T`物理意义：f(v) 表示在速率 v 附近，单位速率区间内的分子数占总分子数的百分比。`);
  bodyPara(T`区间概率：ΔN/N = ∫v₁^v₂ f(v) dv`);
  bodyPara(T`区间分子数：ΔN = N∫v₁^v₂ f(v) dv`);
  bodyPara(T`速率平均值：g(v)̄ = ∫₀^∞ g(v)f(v) dv`);
});
// ==================== 第9章 热力学基础 ====================
addSection(T`第9章 热力学基础`, 1, 2, () => {
  children.push(heading(T`一、热力学第一定律`, 2));
  formulaPara(T`Q = ΔE + A （有限过程）`);
  formulaPara(T`dQ = dE + dA （微小过程）`);
  notePara(T`符号约定：系统吸热 Q > 0，对外做功 A > 0，内能增加 ΔE > 0。`);

  children.push(heading(T`二、功、内能增量、热量`, 2));
  children.push(heading(T`1. 体积功（准静态过程）`, 3));
  formulaPara(T`dA = p dV,  A = ∫V₁^V₂ p dV`);
  notePara(T`p-V 图面积法：过程曲线下面积等于功的大小。`);

  children.push(heading(T`2. 内能增量`, 3));
  formulaPara(T`dE = (m/M)(i/2)R dT,  ΔE = (m/M)(i/2)RΔT`);
  notePara(T`特点：只与始末温度有关，与过程无关。`);

  children.push(heading(T`3. 热量`, 3));
  formulaPara(T`Q = (m/M)CmΔT = νCmΔT`);
  bodyPara(T`Cm：摩尔热容量`);
  bodyPara(T`等压摩尔热容量：Cp = CV + R = (i+2)/2 · R`);
  bodyPara(T`等容摩尔热容量：CV = (i/2)R`);
  bodyPara(T`比热比：γ = Cp/CV = (i+2)/i`);

  children.push(heading(T`三、四个等值过程`, 2));
  const widths = [1800, 1800, 2200, 2200, 2200];
  const headerCell = (text, w) => cell(text, {
    shading: { type: ShadingType.CLEAR, fill: palette.fill },
    width: { size: w, type: WidthType.DXA },
  });
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: widths,
    rows: [
      new TableRow({ children: [
        headerCell(T`过程`, widths[0]), headerCell(T`特征`, widths[1]),
        headerCell(T`功 A`, widths[2]), headerCell(T`内能增量 ΔE`, widths[3]), headerCell(T`热量 Q`, widths[4]),
      ]}),
      new TableRow({ children: [
        cell(T`等容`, widths[0]), cell(T`V = 常数`, widths[1]),
        cellMath(T`0`, widths[2]), cellMath(T`(m/M)CVΔT`, widths[3]), cellMath(T`(m/M)CVΔT`, widths[4]),
      ]}),
      new TableRow({ children: [
        cell(T`等压`, widths[0]), cell(T`p = 常数`, widths[1]),
        cellMath(T`pΔV = (m/M)RΔT`, widths[2]), cellMath(T`(m/M)CVΔT`, widths[3]), cellMath(T`(m/M)CpΔT`, widths[4]),
      ]}),
      new TableRow({ children: [
        cell(T`等温`, widths[0]), cell(T`T = 常数`, widths[1]),
        cellMath(T`(m/M)RT ln(V₂/V₁)`, widths[2]), cellMath(T`0`, widths[3]), cellMath(T`(m/M)RT ln(V₂/V₁)`, widths[4]),
      ]}),
      new TableRow({ children: [
        cell(T`绝热`, widths[0]), cell(T`Q = 0`, widths[1]),
        cellMath(T`-ΔE`, widths[2]), cellMath(T`(m/M)CVΔT`, widths[3]), cellMath(T`0`, widths[4]),
      ]}),
    ],
  }));

  children.push(heading(T`绝热过程方程（泊松方程）`, 3));
  formulaPara(T`pV^γ = C₁,  TV^(γ-1) = C₂,  p^(1-γ)T^γ = C₃`);
  notePara(T`应用：常需联立状态方程 pV = (m/M)RT 与过程方程求解。`);

  children.push(heading(T`四、循环过程`, 2));
  children.push(heading(T`1. 热机效率与制冷系数`, 3));
  formulaPara(T`η = A/Q₁ = (Q₁ - Q₂)/Q₁ = 1 - Q₂/Q₁`);
  formulaPara(T`ω = Q₂/A = Q₂/(Q₁ - Q₂)`);
  notePara(T`Q₁：从高温热源吸热；Q₂：向低温热源放热；A：对外做净功。`);

  children.push(heading(T`2. 卡诺循环`, 3));
  bodyPara(T`由两条绝热线和两条等温线组成。`);
  formulaPara(T`η = 1 - T₂/T₁`);
  formulaPara(T`ω = T₂/(T₁ - T₂)`);
  notePara(T`效率只与两热源温度有关，与工作物质无关。`);

  children.push(heading(T`五、熵与熵变`, 2));
  formulaPara(T`ΔS = ∫ dQ可逆/T`);
  bodyPara(T`可逆等温：ΔS = Q/T`);
  bodyPara(T`可逆等压：ΔS = (m/M)Cp ln(T₂/T₁)`);
  bodyPara(T`可逆等容：ΔS = (m/M)CV ln(T₂/T₁)`);
  bodyPara(T`理想气体任意可逆：ΔS = (m/M)CV ln(T₂/T₁) + (m/M)R ln(V₂/V₁)`);
  notePara(T`不可逆过程：设计连接初末态的可逆过程，利用熵的叠加性计算。`);
  notePara(T`熵是状态量，只与初末态有关，与过程无关。`);
});

// ==================== 第10章 静电场 ====================
addSection(T`第10章 静电场`, 1, 4, () => {
  children.push(heading(T`一、电场强度`, 2));
  children.push(heading(T`1. 定义`, 3));
  formulaPara(T`E⃗ = F⃗/q₀`);
  bodyPara(T`点电荷场强：E = q/(4πε₀r²)，方向沿径向。`);

  children.push(heading(T`2. 场强叠加原理`, 3));
  bodyPara(T`点电荷系：E⃗ = Σᵢ qᵢ/(4πε₀rᵢ²) e⃗ᵣᵢ`);
  bodyPara(T`连续带电体：E⃗ = ∫ dq/(4πε₀r²) e⃗ᵣ`);

  children.push(heading(T`3. 高斯定理`, 3));
  formulaPara(T`∮S E⃗·dS⃗ = (1/ε₀)Σ q内`);
  bodyPara(T`介质中：∮S D⃗·dS⃗ = Σ q自由，其中 D = ε₀εᵣE = εE`);
  notePara(T`高斯定理适用三种对称：球对称、柱（轴）对称、面对称。`);

  children.push(heading(T`4. 几种特殊带电体的场强`, 3));
  const widthsE = [3200, 5800];
  const hCell = (text) => cell(text, { shading: { type: ShadingType.CLEAR, fill: palette.fill }, width: { size: widthsE[0], type: WidthType.DXA } });
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: widthsE,
    rows: [
      new TableRow({ children: [hCell(T`带电体`), hCell(T`场强公式`)] }),
      new TableRow({ children: [cell(T`无限长带电直线`, widthsE[0]), cellMath(T`E = λ/(2πε₀r)`, widthsE[1])] }),
      new TableRow({ children: [cell(T`无限大带电平面`, widthsE[0]), cellMath(T`E = σ/(2ε₀)`, widthsE[1])] }),
      new TableRow({ children: [cell(T`均匀带电圆环轴线上`, widthsE[0]), cellMath(T`E = qx/[4πε₀(R²+x²)^(3/2)]`, widthsE[1])] }),
      new TableRow({ children: [cell(T`均匀带电球面（外）`, widthsE[0]), cellMath(T`E = q/(4πε₀r²)`, widthsE[1])] }),
      new TableRow({ children: [cell(T`均匀带电球体（外）`, widthsE[0]), cellMath(T`E = q/(4πε₀r²)`, widthsE[1])] }),
      new TableRow({ children: [cell(T`均匀带电球体（内）`, widthsE[0]), cellMath(T`E = qr/(4πε₀R³)`, widthsE[1])] }),
    ],
  }));
  notePara(T`补偿法：挖去空腔可看作"完整带电体 + 反向带电空腔"叠加。`);

  children.push(heading(T`二、电势与电势差`, 2));
  children.push(heading(T`1. 定义`, 3));
  formulaPara(T`Uₚ = ∫ₚ^参考点 E⃗·dl⃗`);
  formulaPara(T`Uₐᵦ = Uₐ - Uᵦ = ∫ₐᵦ E⃗·dl⃗`);
  notePara(T`电势零点：通常取无穷远或接地处为 U = 0。`);

  children.push(heading(T`2. 电势叠加原理`, 3));
  bodyPara(T`点电荷：U = q/(4πε₀r)`);
  bodyPara(T`点电荷系：U = Σᵢ qᵢ/(4πε₀rᵢ)`);
  bodyPara(T`连续带电体：U = ∫ dq/(4πε₀r)`);
  notePara(T`球面电势（重点）：U = q/(4πε₀R)（球面上），U = q/(4πε₀r)（球外）。多球面电势叠加：各球面分别贡献后求代数和。`);

  children.push(heading(T`三、电场力的功与电势能`, 2));
  bodyPara(T`电场力的功：Wₐᵦ = qUₐᵦ = q(Uₐ - Uᵦ)`);
  bodyPara(T`电势能：W = qU，注意零点选择。`);

  children.push(heading(T`四、静电场中的导体`, 2));
  bodyPara(T`静电平衡条件：`);
  bodyPara(T`1. 导体内部 E = 0`);
  bodyPara(T`2. 导体是等势体，表面是等势面`);
  bodyPara(T`3. 电荷只分布在表面（实心导体内部无净电荷）`);
  bodyPara(T`导体性质：空腔内有电荷 q 时，空腔内壁感应 -q，外壁感应 +q。接地导体：接地处电势为 0，表面电荷可能全部流入大地。导体接地时特别注意表面电荷分布。`);

  children.push(heading(T`五、电容器`, 2));
  children.push(heading(T`1. 电容定义`, 3));
  formulaPara(T`C = Q/U`);

  children.push(heading(T`2. 常见电容器`, 3));
  const widthsC = [2200, 6800];
  const hCellC = (text) => cell(text, { shading: { type: ShadingType.CLEAR, fill: palette.fill }, width: { size: widthsC[0], type: WidthType.DXA } });
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: widthsC,
    rows: [
      new TableRow({ children: [hCellC(T`类型`), hCellC(T`电容公式`)] }),
      new TableRow({ children: [cell(T`平行板`, widthsC[0]), cellMath(T`C = ε₀εᵣS/d`, widthsC[1])] }),
      new TableRow({ children: [cell(T`圆柱形`, widthsC[0]), cellMath(T`C = 2πε₀εᵣl / ln(R₂/R₁)`, widthsC[1])] }),
      new TableRow({ children: [cell(T`球形`, widthsC[0]), cellMath(T`C = 4πε₀εᵣ · R₁R₂/(R₂-R₁)`, widthsC[1])] }),
    ],
  }));

  children.push(heading(T`3. 串并联`, 3));
  bodyPara(T`串联：1/C = 1/C₁ + 1/C₂ + ...，各电容器 Q 相同。`);
  bodyPara(T`并联：C = C₁ + C₂ + ...，各电容器 U 相同。`);

  children.push(heading(T`4. 插入介质问题（重点）`, 3));
  const widthsM = [2000, 1800, 1800, 1800, 1800];
  const hCellM = (text, w) => cell(text, { shading: { type: ShadingType.CLEAR, fill: palette.fill }, width: { size: w, type: WidthType.DXA } });
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: widthsM,
    rows: [
      new TableRow({ children: [
        hCellM(T`条件`, widthsM[0]), hCellM(T`C`, widthsM[1]), hCellM(T`Q`, widthsM[2]),
        hCellM(T`U`, widthsM[3]), hCellM(T`E`, widthsM[4]),
      ]}),
      new TableRow({ children: [
        cell(T`保持与电源连接（U不变）`, widthsM[0]), cellMath(T`增大εᵣ倍`, widthsM[1]),
        cellMath(T`增大εᵣ倍`, widthsM[2]), cellMath(T`不变`, widthsM[3]), cellMath(T`减小为1/εᵣ`, widthsM[4]),
      ]}),
      new TableRow({ children: [
        cell(T`断开电源后（Q不变）`, widthsM[0]), cellMath(T`增大εᵣ倍`, widthsM[1]),
        cellMath(T`不变`, widthsM[2]), cellMath(T`减小为1/εᵣ`, widthsM[3]), cellMath(T`减小为1/εᵣ`, widthsM[4]),
      ]}),
    ],
  }));
  notePara(T`有介质时：D = ε₀εᵣE，D 只与自由电荷有关。`);

  children.push(heading(T`六、电场能量`, 2));
  children.push(heading(T`1. 电容器储能`, 3));
  formulaPara(T`W = Q²/(2C) = (1/2)CU² = (1/2)QU`);

  children.push(heading(T`2. 电场能量密度`, 3));
  formulaPara(T`w = (1/2)εE² = D²/(2ε)`);
  bodyPara(T`真空时：w = (1/2)ε₀E²`);

  children.push(heading(T`3. 定域空间 V 内的能量`, 3));
  formulaPara(T`W = ∫V w dV = ∫V (1/2)εE² dV`);
  notePara(T`对电容器：W = (1/2)CU² = (1/2)εE²·V（均匀场）。`);
});

// ==================== 第11章 稳恒磁场 ====================
addSection(T`第11章 稳恒磁场`, 1, 6, () => {
  children.push(heading(T`一、磁感应强度`, 2));
  children.push(heading(T`1. 毕奥-萨伐尔定律`, 3));
  formulaPara(T`dB⃗ = (μ₀/4π) · I dl⃗×r⃗ / r³`);
  bodyPara(T`运动电荷磁场：B⃗ = (μ₀/4π) · qv⃗×r⃗ / r³`);

  children.push(heading(T`2. 安培环路定理`, 3));
  formulaPara(T`∮L B⃗·dl⃗ = μ₀Σ I内`);
  bodyPara(T`磁介质中：∮L H⃗·dl⃗ = Σ I₀内（传导电流）`);
  bodyPara(T`其中 H = B/μ₀ - M = B/μ = B/(μ₀μᵣ)`);
  notePara(T`B、H、M 关系：B⃗ = μ₀(H⃗ + M⃗) = μ₀μᵣH⃗`);

  children.push(heading(T`3. 几种特殊电流的磁场`, 3));
  const widthsB = [3200, 5800];
  const hCellB = (text) => cell(text, { shading: { type: ShadingType.CLEAR, fill: palette.fill }, width: { size: widthsB[0], type: WidthType.DXA } });
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: widthsB,
    rows: [
      new TableRow({ children: [hCellB(T`载流导体`), hCellB(T`磁场公式`)] }),
      new TableRow({ children: [cell(T`有限长直导线（距a）`, widthsB[0]), cellMath(T`B = (μ₀I/4πa)(cosθ₁ - cosθ₂)`, widthsB[1])] }),
      new TableRow({ children: [cell(T`无限长直导线`, widthsB[0]), cellMath(T`B = μ₀I/(2πr)`, widthsB[1])] }),
      new TableRow({ children: [cell(T`导线延长线上`, widthsB[0]), cellMath(T`B = 0`, widthsB[1])] }),
      new TableRow({ children: [cell(T`圆电流轴线上`, widthsB[0]), cellMath(T`B = μ₀IR²/[2(R²+x²)^(3/2)]`, widthsB[1])] }),
      new TableRow({ children: [cell(T`圆心处`, widthsB[0]), cellMath(T`B = μ₀I/(2R)`, widthsB[1])] }),
      new TableRow({ children: [cell(T`圆弧圆心处`, widthsB[0]), cellMath(T`B = μ₀Iθ/(4πR)（θ为弧度）`, widthsB[1])] }),
      new TableRow({ children: [cell(T`长直螺线管`, widthsB[0]), cellMath(T`B = μ₀nI（管内）`, widthsB[1])] }),
      new TableRow({ children: [cell(T`螺绕环`, widthsB[0]), cellMath(T`B = μ₀nI = μ₀NI/(2πr)（环内）`, widthsB[1])] }),
    ],
  }));
  notePara(T`磁通量：Φ = ∫S B⃗·dS⃗`);

  children.push(heading(T`二、磁力`, 2));
  children.push(heading(T`1. 洛伦兹力`, 3));
  formulaPara(T`F⃗ = qv⃗×B⃗`);
  bodyPara(T`大小：F = qvB sinθ`);
  bodyPara(T`方向：右手定则（正电荷）`);
  bodyPara(T`带电粒子垂直入匀强磁场：圆周运动，半径 R = mv/(qB)，周期 T = 2πm/(qB)`);

  children.push(heading(T`2. 安培力`, 3));
  bodyPara(T`电流元：dF⃗ = I dl⃗×B⃗`);
  bodyPara(T`载流导线：F⃗ = ∫ I dl⃗×B⃗`);
  bodyPara(T`匀强磁场中：F = BIL sinθ（闭合线圈净力为 0）`);
  bodyPara(T`曲线电流在匀强磁场中：可用直导线等效（起点到终点）`);

  children.push(heading(T`3. 磁力矩与磁矩`, 3));
  bodyPara(T`磁矩：m⃗ = NIS n⃗（N 匝，S 面积，方向由右手定则）`);
  formulaPara(T`M⃗ = m⃗×B⃗`);
  bodyPara(T`大小：M = NISB sinθ = mB sinθ`);
  notePara(T`平衡问题：磁力矩与重力矩等平衡，M磁 ≥ M重 时不翻滚。`);

  children.push(heading(T`三、磁力的功`, 2));
  formulaPara(T`A = IΔΦ`);
  notePara(T`本章要求不高，了解即可。`);
});

// ==================== 第12章 电磁感应 ====================
addSection(T`第12章 电磁感应`, 1, 8, () => {
  children.push(heading(T`一、电动势`, 2));
  formulaPara(T`ℰ = ∫₋⁺ E⃗ₖ·dl⃗`);
  notePara(T`E⃗ₖ：非静电力场强。正方向：电源内部由负极指向正极。`);

  children.push(heading(T`二、法拉第电磁感应定律`, 2));
  formulaPara(T`ℰ = -dΨ/dt`);
  bodyPara(T`磁链：Ψ = NΦ（N 匝线圈）`);
  bodyPara(T`Φ 必须是时间的函数。`);
  bodyPara(T`符号：ℰ > 0 时电动势方向与回路绕行方向一致；ℰ < 0 时相反。`);
  notePara(T`楞次定律：感应电流的磁场总是阻碍原磁通量的变化。`);

  children.push(heading(T`三、动生电动势`, 2));
  formulaPara(T`ℰ = ∫ (v⃗×B⃗)·dl⃗`);
  bodyPara(T`非静电力场强：E⃗ₖ = v⃗×B⃗`);
  bodyPara(T`大小：ℰ = vBl sinθ（θ 为 v 与 B 夹角）`);
  bodyPara(T`方向判断：v⃗×B⃗ 的方向。`);
  notePara(T`与法拉第定律配合使用：导体运动时构成回路，可用 -dΦ/dt 计算。`);

  children.push(heading(T`四、感生电动势`, 2));
  formulaPara(T`∮L E⃗ᵢ·dl⃗ = -dΦ/dt`);
  bodyPara(T`感生电场（涡旋电场）E⃗ᵢ：由变化磁场产生。`);
  bodyPara(T`特点：任一点感生电场方向与该点矢径方向垂直。`);
  bodyPara(T`圆柱形空间（r < R 时均匀变化）：Eᵢ = (r/2)|dB/dt|`);
  notePara(T`用法：尽量利用法拉第定律，通过辅助回路求解。`);

  children.push(heading(T`五、位移电流`, 2));
  formulaPara(T`Iₔ = dΦᴅ/dt = ε₀ dΦᴇ/dt`);
  bodyPara(T`位移电流密度：jₔ = dD/dt = ε₀ dE/dt`);
  bodyPara(T`方向：与 dE/dt 方向相同。`);

  children.push(heading(T`六、自感与互感`, 2));
  children.push(heading(T`1. 自感`, 3));
  formulaPara(T`L = Ψ/I`);
  formulaPara(T`ℰᴸ = -L dI/dt`);
  notePara(T`长直螺线管自感：L = μ₀n²V = μ₀n²Sl`);

  children.push(heading(T`2. 互感`, 3));
  formulaPara(T`M = Ψ₂₁/I₁ = Ψ₁₂/I₂`);
  formulaPara(T`ℰ₂₁ = -M dI₁/dt,   ℰ₁₂ = -M dI₂/dt`);
  notePara(T`注意：求 M 时给谁通电流的问题。`);

  children.push(heading(T`七、磁场能量`, 2));
  children.push(heading(T`1. 线圈磁能`, 3));
  formulaPara(T`W = (1/2)LI²`);

  children.push(heading(T`2. 磁场能量密度`, 3));
  formulaPara(T`w = B²/(2μ) = (1/2)μH² = (1/2)BH`);
  bodyPara(T`真空：w = B²/(2μ₀)`);

  children.push(heading(T`3. 空间磁场能量`, 3));
  formulaPara(T`W = ∫V w dV = ∫V B²/(2μ) dV`);
  notePara(T`多线圈系统：总能量 W = (1/2)L₁I₁² + (1/2)L₂I₂² + MI₁I₂`);

  children.push(heading(T`八、麦克斯韦方程组（积分形式）`, 2));
  formulaPara(T`∮S D⃗·dS⃗ = ∫V ρ dV    （电场高斯定理）`);
  formulaPara(T`∮L E⃗·dl⃗ = -∫S (∂B⃗/∂t)·dS⃗    （法拉第定律）`);
  formulaPara(T`∮S B⃗·dS⃗ = 0    （磁场高斯定理）`);
  formulaPara(T`∮L H⃗·dl⃗ = ∫S (j⃗ + ∂D⃗/∂t)·dS⃗    （安培-麦克斯韦定律）`);
  notePara(T`要求：能写出积分形式，并理解各方程含义。`);
});

// ==================== 第13章 量子物理基础 ====================
addSection(T`第13章 量子物理基础（概要）`, 1, 10, () => {
  notePara(T`根据习题解答补充，若考试涉及需掌握。`);

  children.push(heading(T`一、黑体辐射`, 2));
  bodyPara(T`斯特藩-玻尔兹曼定律：M = σT⁴`);
  bodyPara(T`维恩位移定律：λₘT = b`);
  bodyPara(T`普朗克量子假说：E = hν`);

  children.push(heading(T`二、光电效应`, 2));
  formulaPara(T`hν = (1/2)mvₘₐₓ² + A = eUₐ + A`);
  bodyPara(T`红限频率：ν₀ = A/h`);
  bodyPara(T`红限波长：λ₀ = hc/A`);

  children.push(heading(T`三、康普顿散射`, 2));
  formulaPara(T`Δλ = λ - λ₀ = λc(1 - cosθ)`);
  bodyPara(T`康普顿波长：λc = h/(mₑc) = 2.43×10⁻¹² m`);

  children.push(heading(T`四、玻尔氢原子理论`, 2));
  formulaPara(T`rₙ = n² ε₀h²/(πme²) = n² a₀  (a₀ = 0.529 Å)`);
  formulaPara(T`Eₙ = -13.6/n² eV`);

  children.push(heading(T`五、德布罗意波`, 2));
  formulaPara(T`λ = h/p = h/(mv)`);

  children.push(heading(T`六、不确定关系`, 2));
  formulaPara(T`Δx Δpₓ ≥ ℏ/2`);
  formulaPara(T`ΔE Δt ≥ ℏ/2`);

  children.push(heading(T`七、波函数与势阱`, 2));
  bodyPara(T`归一化：∫|ψ|² dV = 1`);
  bodyPara(T`一维无限深势阱：ψₙ = √(2/a) sin(nπx/a)，Eₙ = n²π²ℏ²/(2ma²)`);
});

// ==================== 高频考试题型速查 ====================
addSection(T`高频考试题型速查`, 1, 11, () => {
  children.push(heading(T`热学`, 2));
  bodyPara(T`1. 理想气体状态方程变形（求分子数密度、质量密度等）`);
  bodyPara(T`2. 三种速率的应用（注意 vp ∝ √(T/M)）`);
  bodyPara(T`3. 速率分布函数归一化条件求待定系数（面积法）`);
  bodyPara(T`4. 区间分子数/概率计算`);
  bodyPara(T`5. 等值过程 Q、A、ΔE 的计算（常联立状态方程）`);
  bodyPara(T`6. 循环效率/制冷系数（卡诺循环重点）`);
  bodyPara(T`7. 熵变计算（设计可逆过程）`);

  children.push(heading(T`静电场`, 2));
  bodyPara(T`1. 高斯定理求场强（球/柱/面对称）`);
  bodyPara(T`2. 电势叠加（多球面问题、补偿法）`);
  bodyPara(T`3. 导体静电平衡（电荷分布、接地问题）`);
  bodyPara(T`4. 电容器电容及串并联`);
  bodyPara(T`5. 插入介质问题（U 不变 vs Q 不变）`);
  bodyPara(T`6. 电场能量/能量密度计算`);

  children.push(heading(T`稳恒磁场`, 2));
  bodyPara(T`1. 毕奥-萨伐尔定律求 B（直导线、圆环、圆弧叠加）`);
  bodyPara(T`2. 安培环路定理（注意 B、H、M 关系）`);
  bodyPara(T`3. 洛伦兹力应用（圆周运动半径、周期）`);
  bodyPara(T`4. 安培力计算（匀强磁场中等效直导线）`);
  bodyPara(T`5. 磁矩、磁力矩计算`);

  children.push(heading(T`电磁感应`, 2));
  bodyPara(T`1. 法拉第定律（关键是求磁通量 Φ(t)）`);
  bodyPara(T`2. 动生电动势（v×B 方向，与法拉第定律配合）`);
  bodyPara(T`3. 感生电场/感生电动势（圆柱形空间重点）`);
  bodyPara(T`4. 自感/互感计算`);
  bodyPara(T`5. 位移电流大小与方向`);
  bodyPara(T`6. 磁场能量计算（多线圈含互感能）`);
  bodyPara(T`7. 麦克斯韦方程组积分形式`);
});

// ==================== 常用常数 ====================
addSection(T`常用常数`, 1, 12, () => {
  const widthsK = [2800, 1200, 5000];
  const hCellK = (text, w) => cell(text, { shading: { type: ShadingType.CLEAR, fill: palette.fill }, width: { size: w, type: WidthType.DXA } });
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: widthsK,
    rows: [
      new TableRow({ children: [hCellK(T`常数`, widthsK[0]), hCellK(T`符号`, widthsK[1]), hCellK(T`数值`, widthsK[2])] }),
      new TableRow({ children: [cell(T`真空中介电常数`, widthsK[0]), cellMath(T`ε₀`, widthsK[1]), cellMath(T`8.85×10⁻¹² F/m`, widthsK[2])] }),
      new TableRow({ children: [cell(T`真空中磁导率`, widthsK[0]), cellMath(T`μ₀`, widthsK[1]), cellMath(T`4π×10⁻⁷ H/m`, widthsK[2])] }),
      new TableRow({ children: [cell(T`普朗克常量`, widthsK[0]), cellMath(T`h`, widthsK[1]), cellMath(T`6.63×10⁻³⁴ J·s`, widthsK[2])] }),
      new TableRow({ children: [cell(T`玻尔兹曼常量`, widthsK[0]), cellMath(T`k`, widthsK[1]), cellMath(T`1.38×10⁻²³ J/K`, widthsK[2])] }),
      new TableRow({ children: [cell(T`气体普适常量`, widthsK[0]), cellMath(T`R`, widthsK[1]), cellMath(T`8.31 J/(mol·K)`, widthsK[2])] }),
      new TableRow({ children: [cell(T`阿伏伽德罗常量`, widthsK[0]), cellMath(T`NA`, widthsK[1]), cellMath(T`6.02×10²³ mol⁻¹`, widthsK[2])] }),
      new TableRow({ children: [cell(T`电子电荷`, widthsK[0]), cellMath(T`e`, widthsK[1]), cellMath(T`1.60×10⁻¹⁹ C`, widthsK[2])] }),
      new TableRow({ children: [cell(T`电子质量`, widthsK[0]), cellMath(T`mₑ`, widthsK[1]), cellMath(T`9.11×10⁻³¹ kg`, widthsK[2])] }),
      new TableRow({ children: [cell(T`真空光速`, widthsK[0]), cellMath(T`c`, widthsK[1]), cellMath(T`3.0×10⁸ m/s`, widthsK[2])] }),
    ],
  }));
  notePara(T`1/(4πε₀) = 9.0×10⁹ N·m²/C²`);
});

// ==================== Document Build ====================
const doc = new Document({
  features: { updateFields: true },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1200,
            bottom: 1200,
            left: 1200,
            right: 1200,
          },
        },
      },
      headers: {
        default: new Header({
          children: [
            para(run(docTitle, { bold: true, color: palette.primary, size: 20 }), {
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            para(
              new TextRun({ children: [PageNumber.CURRENT], size: 20 }),
              {
                alignment: AlignmentType.CENTER,
              },
            ),
          ],
        }),
      },
      children: [
        ...children,
        para(run(T`祝考试顺利，高分拿下！`, { italics: true, color: palette.accent, size: 24 }), {
          alignment: AlignmentType.CENTER,
          spacing: { before: 360, after: 120 },
        }),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync(outputPath, buffer);
