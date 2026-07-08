# Schemas

> 数据结构的"宪法" — 所有数据必须符合这些 Schema

## 当前 Schema

| Schema | 文件 | 版本 | 状态 | 说明 |
|--------|------|------|------|------|
| Country | [country.schema.json](country.schema.json) | 2.0.0 | stable | 国家/地区基础信息 |

## 使用方式

### 校验数据

```bash
npm run validate
```

### 在代码中使用

```javascript
const Ajv = require('ajv');
const schema = require('./schemas/country.schema.json');

const ajv = new Ajv();
const validate = ajv.compile(schema);

const valid = validate(data);
if (!valid) console.log(validate.errors);
```

## Schema 版本控制

使用 Semantic Versioning：
- MAJOR: 不兼容的结构变更
- MINOR: 新增字段（兼容）
- PATCH: 修正描述/约束

## 计划中的 Schema

详见 [index.json](index.json) 中的 `planned` 数组。
