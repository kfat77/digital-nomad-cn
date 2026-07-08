# 桌面宠物 - Desktop Pet 🐱

一只可爱的橘色小猫桌面宠物！运行程序后点击"召唤小猫"按钮，小猫就会从按钮下方探出脑袋，然后跳出来在桌面上自由活动！

## 演示效果

1. 运行程序，显示启动窗口
2. 点击 **"✨ 召唤小猫"** 按钮
3. 小猫从按钮下方探出脑袋，然后弹跳跳出
4. 小猫在桌面上自由走动，偶尔眨眼、摇尾巴

## 环境要求

- Python 3.8+
- Windows / macOS / Linux

## 安装与运行

```bash
# 克隆仓库
git clone https://github.com/kfat77/desktop-pet.git
cd desktop-pet

# 安装依赖
pip install -r requirements.txt

# 运行
python -m desktop_pet
```

## 交互说明

| 操作 | 效果 |
|------|------|
| 点击"召唤小猫"按钮 | 从按钮位置召唤小猫 |
| 点击小猫 | 小猫跳跃并显示"喵~" |
| 拖动小猫 | 把它放到桌面任意位置 |
| 右键托盘图标 | 退出程序 |

## 项目结构

```
desktop-pet/
├── desktop_pet/
│   ├── __init__.py
│   ├── __main__.py          # 入口
│   ├── main.py              # 程序主逻辑
│   ├── launcher.py          # 启动窗口（召唤按钮）
│   ├── tray_app.py          # 系统托盘
│   ├── selection_overlay.py # 矩形选择覆盖层
│   ├── pet_window.py        # 宠物主窗口
│   └── cat_widget.py        # 小猫绘制与动画
├── requirements.txt
└── README.md
```

## 技术栈

- **PySide6**: 跨平台GUI框架，用于窗口、动画和绘制
- **QPainter**: 2D矢量绘制（猫咪图形、矩形框）
- **QPropertyAnimation**: 流畅的探头/跳出动画

## License

MIT License
