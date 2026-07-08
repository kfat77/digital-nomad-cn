# PhotoCrypt Social — 真实性社交平台

> 一个仿 Instagram 的 Android 社交应用，核心卖点：**每一张通过本应用拍摄的照片，都经过数字水印+签名+哈希处理，确保照片来源真实可信**。

---

## 项目概述

| 属性 | 内容 |
|------|------|
| **应用名称** | VeriPic (真实拍) / 或 PhotoCrypt Social |
| **平台** | Android (Google Play) |
| **开发语言** | Kotlin |
| **UI 框架** | Jetpack Compose |
| **相机** | CameraX |
| **后端** | Python FastAPI + PostgreSQL |
| **区块链** | Ethereum/Polygon (Web3j) |
| **存储** | IPFS / 阿里云OSS |

---

## 核心卖点（一句话描述）

> "VeriPic 是世界上第一个**只接受真实拍摄照片**的社交平台。在这里，没有盗图、没有AI生成、没有截图转发 —— 每一张照片都由设备私钥签名，通过区块链验证其原始真实性。"

---

## 界面设计（仿 Instagram）

```
┌─────────────────────────────────────┐
│  VeriPic                            │  ← 顶部标题栏
├─────────────────────────────────────┤
│  📷 [拍照]  🏠 [主页]  👤 [我的]   │  ← 底部导航栏 (3个Tab)
├─────────────────────────────────────┤
│                                     │
│  Tab 1: 拍照界面 (CameraScreen)     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │      [相机预览画面]          │   │
│  │                             │   │
│  │    🔴  拍摄按钮              │   │
│  │                             │   │
│  │  📸 拍照后自动:              │   │
│  │  ✓ 嵌入数字水印              │   │
│  │  ✓ Ed25519 设备签名          │   │
│  │  ✓ 计算感知哈希              │   │
│  │  ✓ 生成区块链上链数据          │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  Tab 2: 主页 Feed (HomeScreen)      │
│  ┌─────────────────────────────┐   │
│  │  👤 username  🔒 已验证      │   │
│  │  ┌─────────────────────┐   │   │
│  │  │                     │   │   │
│  │  │    [照片内容]        │   │   │
│  │  │                     │   │   │
│  │  └─────────────────────┘   │   │
│  │  ❤️ 128  💬 12  🔄 分享    │   │
│  │  📍 北京 | 📷 iPhone 15 Pro │   │
│  │  🔐 区块链验证: 0xabc...    │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  Tab 3: 个人界面 (ProfileScreen)    │
│  ┌─────────────────────────────┐   │
│  │     [头像]                   │   │
│  │   @kfat77                    │   │
│  │   已发布 42 张真实照片        │   │
│  │   获得 1.2k 个赞             │   │
│  │                             │   │
│  │  [照片网格] [照片网格]        │   │
│  │  [照片网格] [照片网格]        │   │
│  │  [照片网格] [照片网格]        │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 核心功能流程

### 1. 拍照流程（最核心的功能）

```
用户打开App → 点击"拍照"Tab → 相机预览
                                          ↓
                                    用户点击拍摄按钮
                                          ↓
    ┌─────────────────────────────────────┐
    │  后台自动执行 PhotoCrypt 加密流程    │
    │                                      │
    │  1. 提取 EXIF (时间/位置/设备型号)   │
    │  2. Ed25519 私钥签名照片哈希          │
    │  3. LSB + DWT 双重水印嵌入签名        │
    │  4. 计算感知哈希 (pHash/dHash/aHash) │
    │  5. 显示预览 + "✓ 真实性已验证"      │
    └─────────────────────────────────────┘
                                          ↓
                                    用户确认发布
                                          ↓
    ┌─────────────────────────────────────┐
    │  发布流程                            │
    │                                      │
    │  1. 水印照片上传 IPFS → 获得 CID     │
    │  2. 调用智能合约铸造 PhotoNFT        │
    │  3. 将 NFT Token ID 保存到后端       │
    │  4. 帖子显示 "🔒 区块链已验证"       │
    └─────────────────────────────────────┘
```

### 2. 浏览 Feed 流程

```
用户打开App → 主页 Tab
                    ↓
            向后端请求帖子列表
                    ↓
            每条帖子显示:
              - 用户名
              - 照片
              - 点赞/评论数
              - 🔒 区块链验证标识 (绿色盾牌)
              - 📷 相机型号
              - 📍 拍摄地点
              - ⏰ 拍摄时间
```

### 3. 验证照片流程（点击验证）

```
用户点击帖子上的 "🔒 已验证" 按钮
                    ↓
            显示验证弹窗:
              - 照片哈希: sha256:xxx...
              - 设备签名: MEUCIQ...
              - 感知哈希: a1b2c3d4...
              - 区块链记录: Token ID #42
              - NFT 合约地址: 0x...
              - 验证结果: ✅ 确认真实拍摄
```

---

## 技术架构

```
┌──────────────────────────────────────────────────────┐
│                   Android App (Kotlin)               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  Jetpack    │  │   CameraX   │  │  Web3j      │  │
│  │  Compose    │  │   (拍照)    │  │  (区块链)   │  │
│  │  (UI)       │  │             │  │             │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  Retrofit   │  │  Room DB    │  │  PhotoCrypt │  │
│  │  (网络请求)  │  │  (本地缓存)  │  │  (水印引擎) │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│              Backend API (Python FastAPI)            │
│  - 用户注册/登录 (JWT Token)                          │
│  - 帖子发布/获取 (CRUD)                              │
│  - 照片验证查询                                       │
│  - IPFS 上传接口                                      │
└──────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  PostgreSQL │   │    IPFS     │   │  Ethereum   │
│  (用户数据)  │   │  (照片存储)  │   │  (NFT合约)  │
└─────────────┘   └─────────────┘   └─────────────┘
```

---

## MVP 功能清单（最小可行产品）

### Phase 1: 核心功能（必须实现）
- [x] 底部导航栏（3个Tab）
- [x] CameraX 拍照界面
- [x] 拍照后自动加水印+签名
- [x] 主页 Feed 浏览帖子
- [x] 发帖功能（照片+描述）
- [x] 个人主页
- [x] 用户注册/登录
- [x] 后端 API（帖子CRUD）

### Phase 2: 区块链功能（增强信任）
- [ ] 钱包连接（MetaMask/WalletConnect）
- [ ] NFT 铸造（照片上链）
- [ ] 链上验证查询
- [ ] 验证徽章显示

### Phase 3: 社交功能（完善体验）
- [ ] 点赞/评论
- [ ] 关注/粉丝
- [ ] 搜索用户
- [ ] 通知系统
- [ ] 照片滤镜（可选）

---

## 开发环境要求

| 工具 | 版本 | 用途 |
|------|------|------|
| Android Studio | 最新版 | IDE |
| JDK | 17+ | Java开发 |
| Kotlin | 1.9+ | 编程语言 |
| Android SDK | API 24+ | 最低支持Android 7.0 |
| Gradle | 8.0+ | 构建工具 |
| Python | 3.10+ | 后端开发 |
| PostgreSQL | 15+ | 数据库 |
| Node.js | 18+ | Hardhat区块链 |

---

## 文件结构

```
PhotoCrypt-Social/
├── android/                          # Android 项目
│   ├── app/
│   │   ├── src/main/java/com/veripic/
│   │   │   ├── MainActivity.kt
│   │   │   ├── VeriPicApp.kt
│   │   │   ├── ui/
│   │   │   │   ├── screens/
│   │   │   │   │   ├── CameraScreen.kt      # 拍照界面
│   │   │   │   │   ├── HomeScreen.kt        # 主页Feed
│   │   │   │   │   ├── ProfileScreen.kt     # 个人界面
│   │   │   │   │   ├── PostDetailScreen.kt  # 帖子详情
│   │   │   │   │   └── LoginScreen.kt       # 登录界面
│   │   │   │   ├── components/
│   │   │   │   │   ├── BottomNavBar.kt
│   │   │   │   │   ├── PostCard.kt
│   │   │   │   │   ├── VerificationBadge.kt
│   │   │   │   │   └── CameraPreview.kt
│   │   │   │   └── theme/
│   │   │   ├── viewmodel/
│   │   │   │   ├── CameraViewModel.kt
│   │   │   │   ├── FeedViewModel.kt
│   │   │   │   └── ProfileViewModel.kt
│   │   │   ├── data/
│   │   │   │   ├── api/
│   │   │   │   │   └── ApiService.kt
│   │   │   │   ├── repository/
│   │   │   │   │   └── PostRepository.kt
│   │   │   │   ├── model/
│   │   │   │   │   ├── Post.kt
│   │   │   │   │   ├── User.kt
│   │   │   │   │   └── VerificationData.kt
│   │   │   │   └── local/
│   │   │   │       ├── AppDatabase.kt
│   │   │   │       └── PostDao.kt
│   │   │   ├── crypt/
│   │   │   │   ├── PhotoCryptEngine.kt      # 核心加密引擎
│   │   │   │   ├── WatermarkEmbedder.kt     # 水印嵌入
│   │   │   │   ├── Ed25519Signer.kt         # 签名模块
│   │   │   │   └── PerceptualHasher.kt      # 感知哈希
│   │   │   └── blockchain/
│   │   │       ├── Web3Manager.kt
│   │   │       └── ContractInterface.kt
│   │   └── build.gradle.kts
│   └── gradle/
│
├── backend/                          # Python 后端
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── posts.py
│   │   └── users.py
│   └── requirements.txt
│
├── contracts/                        # 智能合约
│   └── PhotoNFT.sol
│
└── docs/
    └── README.md
```

---

## 数据库设计

### 用户表 (users)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    wallet_address VARCHAR(42),  -- ETH地址
    public_key TEXT,              -- Ed25519公钥
    created_at TIMESTAMP DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE
);
```

### 帖子表 (posts)
```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    caption TEXT,
    image_url TEXT NOT NULL,           -- IPFS URL
    image_hash VARCHAR(64) NOT NULL,   -- SHA-256
    perceptual_hash VARCHAR(200),      -- pHash:dHash:aHash
    device_signature TEXT,             -- Ed25519签名
    device_model VARCHAR(100),         -- 相机型号
    location_name VARCHAR(200),        -- 地点
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    taken_at TIMESTAMP,                -- 拍摄时间
    nft_token_id INTEGER,              -- NFT Token ID
    contract_address VARCHAR(42),      -- 合约地址
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 点赞表 (likes)
```sql
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    post_id INTEGER REFERENCES posts(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);
```

---

## API 接口设计

### 认证
```
POST /api/auth/register    # 注册
POST /api/auth/login       # 登录
GET  /api/auth/me          # 获取当前用户
```

### 帖子
```
GET    /api/posts          # 获取帖子列表 (Feed)
POST   /api/posts          # 发布帖子
GET    /api/posts/{id}     # 获取帖子详情
DELETE /api/posts/{id}     # 删除帖子
```

### 用户
```
GET /api/users/{username}       # 获取用户信息
GET /api/users/{username}/posts # 获取用户的帖子
```

### 验证
```
GET /api/verify/{post_id}  # 验证帖子真实性
```

---

## Google Play 上架准备

### 1. 应用信息
- **应用名称**: VeriPic (真实拍)
- **简短描述**: 第一个只接受真实拍摄照片的社交平台
- **完整描述**: 介绍 PhotoCrypt 技术、区块链验证、防假图
- **应用图标**: 512x512px
- **功能截图**: 5-8张（手机+平板）
- **宣传视频**: 30秒介绍视频（可选）

### 2. 隐私政策
需要隐私政策页面（可以用 GitHub Pages 托管）

### 3. 应用分级
- 内容分级: PEGI 3+ (全年龄)
- 数据安全: 需要声明收集的数据类型

### 4. 签名打包
- 生成发布密钥 (Keystore)
- 构建 AAB 文件 (Android App Bundle)
- 上传 Google Play Console

---

## 实现步骤（共10步）

### Step 1: 搭建 Android 项目
- 安装 Android Studio
- 创建新项目 (Empty Compose Activity)
- 配置依赖 (CameraX, Retrofit, Room, Coil 等)

### Step 2: 设计 UI 框架
- 实现底部导航栏 (3个Tab)
- 创建 Screen 文件结构
- 定义主题颜色 (仿 Instagram 深色模式)

### Step 3: 实现 CameraX 拍照
- 请求相机权限
- 显示相机预览
- 实现拍照功能
- 保存照片到本地

### Step 4: 集成 PhotoCrypt 加密
- 将 Python 水印/签名/哈希代码移植到 Kotlin
- 或使用 JNI 调用 Python
- 拍照后自动执行加密流程

### Step 5: 实现主页 Feed
- 创建 PostCard UI 组件
- 模拟帖子数据
- 实现列表滚动

### Step 6: 实现发帖流程
- 拍照后显示预览
- 添加描述文字
- 上传照片到后端
- 显示发布成功

### Step 7: 实现个人主页
- 用户资料展示
- 照片网格布局
- 统计信息 (帖子数/获赞数)

### Step 8: 搭建后端 API
- Python FastAPI
- 用户认证 (JWT)
- 帖子 CRUD
- 照片上传

### Step 9: 连接前后端
- Android 调用后端 API
- 用户注册/登录
- 帖子发布/获取
- 图片加载 (Glide/Coil)

### Step 10: 打包上架
- 优化应用大小
- 生成签名 APK/AAB
- 创建 Google Play 开发者账号
- 填写应用信息并提交审核

---

## 预计开发时间

| 阶段 | 时间 | 说明 |
|------|------|------|
| 项目搭建 + UI框架 | 1-2天 | Android Studio + Compose |
| CameraX 拍照 | 1-2天 | 权限 + 预览 + 拍摄 |
| PhotoCrypt 集成 | 2-3天 | Kotlin移植或JNI调用 |
| 后端 API 开发 | 2-3天 | FastAPI + PostgreSQL |
| 前后端连接 | 2-3天 | 网络请求 + 数据展示 |
| 区块链集成 | 2-3天 | Web3j + 合约交互 |
| 测试优化 | 2天 | Bug修复 + 性能优化 |
| Google Play 上架 | 1-2天 | 资料准备 + 提交审核 |
| **总计** | **2-3周** | MVP版本 |

---

> 💡 **建议**: 先实现 Phase 1 (核心功能)，上架 Google Play 获取用户反馈，再逐步添加区块链验证等高级功能。
