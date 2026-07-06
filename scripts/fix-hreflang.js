/**
 * i18n Hreflang 审计与修复脚本
 * 
 * 功能：
 * 1. 扫描 website/ 所有 HTML 文件
 * 2. 检查 hreflang 标签完整性
 * 3. 添加缺失的 hreflang 标签（zh-CN + en + x-default）
 * 4. 同步修复 docs/ 目录（部署副本）
 * 
 * 策略：
 * - 中文页面：如果存在英文版，添加 zh-CN + en + x-default
 * - 英文页面：添加 en + zh-CN + x-default
 * - x-default 始终指向中文页面（主语言）
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://kfat77.github.io/digital-nomad-cn';
const ROOT = path.resolve(__dirname, '../website');
const DOCS_ROOT = path.resolve(__dirname, '../docs');

// 记录日志
const LOG = [];
function log(msg) { LOG.push(msg); console.log(msg); }

/**
 * 获取相对路径（相对于 website/ 目录）
 */
function getRelativePath(absPath) {
  return path.relative(ROOT, absPath).replace(/\\/g, '/');
}

/**
 * 根据中文页面路径推断英文版路径
 */
function getEnglishPath(chinesePath) {
  const rel = getRelativePath(chinesePath);
  // 如果已经是英文版，返回 null
  if (rel.startsWith('en/')) return null;
  return path.join(ROOT, 'en', rel);
}

/**
 * 根据英文页面路径推断中文版路径
 */
function getChinesePath(englishPath) {
  const rel = getRelativePath(englishPath);
  if (!rel.startsWith('en/')) return null;
  const chineseRel = rel.replace(/^en\//, '');
  return path.join(ROOT, chineseRel);
}

/**
 * 获取页面的公开 URL
 */
function getPageUrl(relPath) {
  // 移除 index.html 后缀，保留目录路径
  let urlPath = relPath.replace(/\/index\.html$/, '/');
  return `${BASE_URL}/${urlPath}`;
}

/**
 * 检查文件是否存在
 */
function exists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 读取文件
 */
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * 写入文件
 */
function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * 生成 hreflang 标签块
 */
function generateHreflangBlock(zhUrl, enUrl) {
  if (enUrl) {
    return `    <link rel="alternate" hreflang="zh-CN" href="${zhUrl}">
    <link rel="alternate" hreflang="en" href="${enUrl}">
    <link rel="alternate" hreflang="x-default" href="${zhUrl}">`;
  }
  return `    <link rel="alternate" hreflang="zh-CN" href="${zhUrl}">
    <link rel="alternate" hreflang="x-default" href="${zhUrl}">`;
}

/**
 * 提取现有的 hreflang 标签
 */
function extractHreflangs(content) {
  const hreflangs = [];
  const regex = /<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    hreflangs.push({ lang: match[1], href: match[2] });
  }
  return hreflangs;
}

/**
 * 检查页面是否已有 hreflang（排除 RSS/XML 的 alternate）
 */
function hasHreflang(content) {
  return /<link\s+rel="alternate"\s+hreflang=/i.test(content);
}

/**
 * 从内容中移除所有 hreflang 标签
 */
function removeHreflangs(content) {
  return content.replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="[^"]+">?\s*/gi, '');
}

/**
 * 在 <head> 中合适位置插入 hreflang 标签
 */
function injectHreflang(content, hreflangBlock) {
  // 策略：在 <meta name="theme-color"> 或 <link rel="manifest"> 之后插入
  const insertAfterPatterns = [
    /<meta\s+name="theme-color"[^>]*>/i,
    /<link\s+rel="manifest"[^>]*>/i,
    /<link\s+rel="apple-touch-icon"[^>]*>/i,
    /<link\s+rel="icon"[^>]*>/i,
    /<meta\s+name="twitter:card"[^>]*>/i,
  ];

  for (const pattern of insertAfterPatterns) {
    const match = content.match(pattern);
    if (match) {
      const idx = content.indexOf(match[0]) + match[0].length;
      return content.slice(0, idx) + '\n' + hreflangBlock + content.slice(idx);
    }
  }

  // 备选：在 <head> 标签后插入
  const headMatch = content.match(/<head>\s*/i);
  if (headMatch) {
    const idx = content.indexOf(headMatch[0]) + headMatch[0].length;
    return content.slice(0, idx) + hreflangBlock + '\n' + content.slice(idx);
  }

  return content;
}

/**
 * 递归获取所有 HTML 文件
 */
function getAllHtmlFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllHtmlFiles(fullPath, files);
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * 修复单个页面的 hreflang
 */
function fixPageHreflang(filePath, isEnglish) {
  const rel = getRelativePath(filePath);
  let content = readFile(filePath);
  
  // 获取对应语言版本的 URL
  let zhUrl, enUrl;
  if (isEnglish) {
    const chinesePath = getChinesePath(filePath);
    if (chinesePath && exists(chinesePath)) {
      zhUrl = getPageUrl(getRelativePath(chinesePath));
    }
    enUrl = getPageUrl(rel);
  } else {
    zhUrl = getPageUrl(rel);
    const englishPath = getEnglishPath(filePath);
    if (englishPath && exists(englishPath)) {
      enUrl = getPageUrl(getRelativePath(englishPath));
    }
  }

  // 提取现有的 hreflang
  const existing = extractHreflangs(content);
  
  // 判断是否需要修改
  const needsFix = !hasHreflang(content) || 
    !existing.some(h => h.lang === 'x-default') ||
    !existing.some(h => h.lang === 'zh-CN');

  if (!needsFix) {
    return { fixed: false, rel, reason: 'already_complete' };
  }

  // 移除旧的 hreflang
  content = removeHreflangs(content);

  // 生成新的 hreflang 块
  const hreflangBlock = generateHreflangBlock(zhUrl, enUrl);
  
  // 注入到内容中
  content = injectHreflang(content, hreflangBlock);

  // 写入文件
  writeFile(filePath, content);

  return { 
    fixed: true, 
    rel, 
    zhUrl, 
    enUrl,
    reason: !hasHreflang(readFile(filePath)) ? 'no_hreflang' : 
            !existing.some(h => h.lang === 'x-default') ? 'missing_x_default' : 'missing_zh_CN'
  };
}

/**
 * 主函数
 */
function main() {
  log('=== i18n Hreflang 审计与修复 ===');
  log(`根目录: ${ROOT}`);
  log('');

  const allFiles = getAllHtmlFiles(ROOT);
  log(`总共发现 ${allFiles.length} 个 HTML 文件`);
  log('');

  const stats = {
    total: allFiles.length,
    chinese: 0,
    english: 0,
    fixed: 0,
    alreadyOK: 0,
    errors: 0,
    byReason: {}
  };

  const fixedFiles = [];

  for (const file of allFiles) {
    const rel = getRelativePath(file);
    const isEnglish = rel.startsWith('en/');

    if (isEnglish) {
      stats.english++;
    } else {
      stats.chinese++;
    }

    try {
      const result = fixPageHreflang(file, isEnglish);
      if (result.fixed) {
        stats.fixed++;
        fixedFiles.push(result);
        stats.byReason[result.reason] = (stats.byReason[result.reason] || 0) + 1;
        log(`[FIXED] ${rel}`);
        if (result.enUrl) {
          log(`  zh-CN: ${result.zhUrl}`);
          log(`  en:    ${result.enUrl}`);
          log(`  x-default: ${result.zhUrl}`);
        } else {
          log(`  zh-CN: ${result.zhUrl} (无英文版)`);
          log(`  x-default: ${result.zhUrl}`);
        }
      } else {
        stats.alreadyOK++;
      }
    } catch (err) {
      stats.errors++;
      log(`[ERROR] ${rel}: ${err.message}`);
    }
  }

  log('');
  log('=== 统计 ===');
  log(`中文页面: ${stats.chinese}`);
  log(`英文页面: ${stats.english}`);
  log(`已修复: ${stats.fixed}`);
  log(`无需修改: ${stats.alreadyOK}`);
  log(`错误: ${stats.errors}`);
  log('');
  log('修复原因分布:');
  for (const [reason, count] of Object.entries(stats.byReason)) {
    log(`  ${reason}: ${count}`);
  }

  // 同步到 docs/
  log('');
  log('=== 同步到 docs/ 目录 ===');
  let docsSynced = 0;
  for (const result of fixedFiles) {
    const websitePath = path.join(ROOT, result.rel);
    const docsPath = path.join(DOCS_ROOT, result.rel);
    try {
      if (exists(websitePath)) {
        const content = readFile(websitePath);
        writeFile(docsPath, content);
        docsSynced++;
      }
    } catch (err) {
      log(`[SYNC ERROR] ${result.rel}: ${err.message}`);
    }
  }
  log(`已同步 ${docsSynced} 个文件到 docs/`);

  // 写入审计日志
  const auditLog = {
    timestamp: new Date().toISOString(),
    stats,
    fixedFiles: fixedFiles.map(f => ({ rel: f.rel, zhUrl: f.zhUrl, enUrl: f.enUrl }))
  };
  writeFile(
    path.join(__dirname, '../i18n-audit-log.json'),
    JSON.stringify(auditLog, null, 2)
  );

  log('');
  log('审计日志已保存到 i18n-audit-log.json');
  log('=== 完成 ===');
}

main();
