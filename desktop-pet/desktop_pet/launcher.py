"""
Launcher - 启动窗口，点击按钮召唤小猫。
无需全局鼠标监听，直接运行程序即可。
"""

from PySide6.QtWidgets import QWidget, QVBoxLayout, QPushButton, QLabel, QApplication
from PySide6.QtCore import Qt, Signal, QPoint
from PySide6.QtGui import QMouseEvent


class LauncherWindow(QWidget):
    """启动窗口 - 点击按钮召唤小猫"""
    
    summon_clicked = Signal(QPoint)
    
    def __init__(self, parent=None):
        super().__init__(parent)
        
        # 无边框、置顶、圆角
        self.setWindowFlags(
            Qt.FramelessWindowHint |
            Qt.WindowStaysOnTopHint |
            Qt.Tool
        )
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.setFixedSize(240, 300)
        
        # 样式
        self.setStyleSheet("""
            QWidget {
                background: rgba(255, 255, 255, 0.95);
                border-radius: 16px;
            }
        """)
        
        # 布局
        layout = QVBoxLayout(self)
        layout.setSpacing(16)
        layout.setContentsMargins(24, 28, 24, 24)
        
        # 标题
        title = QLabel("\U0001F431 桌面宠物")
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet("color: #333; font-size: 22px; font-weight: bold; background: transparent;")
        layout.addWidget(title)
        
        # 分割线
        line = QLabel()
        line.setFixedHeight(1)
        line.setStyleSheet("background: #e0e0e0;")
        layout.addWidget(line)
        
        # 说明
        desc = QLabel("一只会在桌面走动的小猫")
        desc.setAlignment(Qt.AlignCenter)
        desc.setStyleSheet("color: #888; font-size: 13px; background: transparent;")
        layout.addWidget(desc)
        
        desc2 = QLabel("点击按钮召唤它！")
        desc2.setAlignment(Qt.AlignCenter)
        desc2.setStyleSheet("color: #aaa; font-size: 12px; background: transparent;")
        layout.addWidget(desc2)
        
        layout.addStretch()
        
        # 召唤按钮
        self.btn = QPushButton("\u2728 召唤小猫")
        self.btn.setFixedSize(170, 48)
        self.btn.setCursor(Qt.PointingHandCursor)
        self.btn.setStyleSheet("""
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #FFB74D, stop:1 #FFA726);
                color: white;
                border: none;
                border-radius: 24px;
                font-size: 15px;
                font-weight: bold;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #FFA726, stop:1 #FF9800);
            }
            QPushButton:pressed {
                background: #F57C00;
            }
        """)
        self.btn.clicked.connect(self._on_summon)
        layout.addWidget(self.btn, alignment=Qt.AlignCenter)
        
        # 退出
        quit_btn = QPushButton("退出程序")
        quit_btn.setStyleSheet("""
            QPushButton {
                background: transparent;
                color: #bbb;
                border: none;
                font-size: 12px;
            }
            QPushButton:hover {
                color: #666;
            }
        """)
        quit_btn.clicked.connect(self.close)
        layout.addWidget(quit_btn, alignment=Qt.AlignCenter)
        
        # 屏幕居中
        screen = QApplication.primaryScreen().geometry()
        self.move(screen.center() - QPoint(120, 150))
        
        # 拖动支持
        self._dragging = False
        self._drag_offset = QPoint()
    
    def _on_summon(self):
        """召唤小猫"""
        btn_pos = self.btn.mapToGlobal(self.btn.rect().center())
        self.summon_clicked.emit(btn_pos)
        self.hide()
    
    def mousePressEvent(self, event: QMouseEvent):
        if event.button() == Qt.LeftButton:
            self._dragging = True
            self._drag_offset = event.pos()
    
    def mouseMoveEvent(self, event: QMouseEvent):
        if self._dragging:
            self.move(self.mapToGlobal(event.pos()) - self._drag_offset)
    
    def mouseReleaseEvent(self, event: QMouseEvent):
        self._dragging = False
