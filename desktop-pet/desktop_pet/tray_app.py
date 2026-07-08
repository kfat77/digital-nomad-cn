"""
Tray App - 系统托盘图标，提供右键菜单和程序控制。
"""

from PySide6.QtWidgets import QSystemTrayIcon, QMenu, QApplication, QMessageBox
from PySide6.QtCore import Signal, QObject, QPoint
from PySide6.QtGui import QIcon, QPixmap, QPainter, QColor, QFont, QFontMetrics
from PySide6.QtCore import Qt


class TrayApp(QObject):
    """系统托盘应用"""
    
    # 信号
    exit_requested = Signal()
    
    def __init__(self, parent=None):
        super().__init__(parent)
        
        # 创建图标
        self._icon = self._create_tray_icon()
        
        # 创建托盘
        self._tray = QSystemTrayIcon(self)
        self._tray.setIcon(self._icon)
        self._tray.setToolTip("桌面宠物 🐱 - 左右键拖动召唤小猫")
        
        # 创建菜单
        self._menu = QMenu()
        
        # 添加菜单项
        self._show_info = self._menu.addAction("🐱 桌面宠物已运行")
        self._show_info.setEnabled(False)
        
        self._menu.addSeparator()
        
        self._show_help = self._menu.addAction("❓ 使用说明")
        self._show_help.triggered.connect(self._on_help)
        
        self._menu.addSeparator()
        
        self._exit_action = self._menu.addAction("🚪 退出")
        self._exit_action.triggered.connect(self._on_exit)
        
        self._tray.setContextMenu(self._menu)
        
        # 点击托盘图标
        self._tray.activated.connect(self._on_activated)
    
    def show(self):
        """显示托盘图标"""
        self._tray.show()
        # 显示气泡提示
        self._tray.showMessage(
            "桌面宠物已启动",
            "按住鼠标左键+右键，向任意方向拖动画出矩形框，\n松开即可召唤小猫！",
            QSystemTrayIcon.Information,
            5000
        )
    
    def _create_tray_icon(self) -> QIcon:
        """创建托盘图标（绘制一个猫脸）"""
        pixmap = QPixmap(64, 64)
        pixmap.fill(QColor(0, 0, 0, 0))
        
        painter = QPainter(pixmap)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # 绘制猫脸
        cat_color = QColor(255, 183, 77)
        
        # 头
        painter.fillEllipse(8, 12, 48, 40, cat_color)
        
        # 耳朵
        painter.fillPolygon([
            QPoint(12, 20), QPoint(4, 4), QPoint(22, 14)
        ], cat_color)
        painter.fillPolygon([
            QPoint(52, 20), QPoint(60, 4), QPoint(42, 14)
        ], cat_color)
        
        # 眼睛
        painter.fillEllipse(20, 22, 8, 10, Qt.white)
        painter.fillEllipse(36, 22, 8, 10, Qt.white)
        painter.fillEllipse(23, 25, 4, 5, QColor(60, 40, 20))
        painter.fillEllipse(39, 25, 4, 5, QColor(60, 40, 20))
        
        # 鼻子
        painter.fillEllipse(30, 34, 4, 3, QColor(255, 130, 140))
        
        painter.end()
        
        return QIcon(pixmap)
    
    def _on_activated(self, reason):
        """托盘图标被激活"""
        if reason == QSystemTrayIcon.DoubleClick:
            self._on_help()
    
    def _on_help(self):
        """显示帮助"""
        help_text = (
            '<h2>\U0001F431 桌面宠物</h2>'
            '<p><b>召唤小猫：</b></p>'
            '<ol>'
            '<li>按住鼠标<b>左键 + 右键</b>同时不放</li>'
            '<li>向任意方向拖动，画出矩形框</li>'
            '<li>松开鼠标，小猫会从框中探出脑袋，然后跳出来！</li>'
            '</ol>'
            '<p><b>互动：</b></p>'
            '<ul>'
            '<li>点击小猫：它会跳跃并叫&#12300;喵~&#12301;</li>'
            '<li>拖动小猫：可以把它放到任意位置</li>'
            '<li>小猫会自动在桌面上走动</li>'
            '</ul>'
            '<p><b>退出：</b>右键点击托盘图标 \u2192 退出</p>'
        )
        QMessageBox.information(None, "桌面宠物 - 使用说明", help_text)
        """显示帮助"""
        QMessageBox.information(
            None,
            "桌面宠物 - 使用说明",
            "<h2>🐱 桌面宠物</h2>"
            "<p><b>召唤小猫：</b></p>"
            "<ol>"
            "<li>按住鼠标<b>左键 + 右键</b>同时不放</li>"
            "<li>向任意方向拖动，画出矩形框</li>"
            "<li>松开鼠标，小猫会从框中探出脑袋，然后跳出来！</li>"
            "</ol>"
            "<p><b>互动：</b></p>"
            "<ul>"
            "<li>点击小猫：它会跳跃并叫"喵~"</li>"
            "<li>拖动小猫：可以把它放到任意位置</li>"
            "<li>小猫会自动在桌面上走动</li>"
            "</ul>"
            "<p><b>退出：</b>右键点击托盘图标 → 退出</p>"
        )
    
    def _on_exit(self):
        """退出程序"""
        self.exit_requested.emit()
