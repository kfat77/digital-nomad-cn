"""
Main - 程序入口，整合所有组件。

运行方式：直接运行程序，显示启动窗口，点击按钮召唤小猫。
"""

import sys
from PySide6.QtWidgets import QApplication
from PySide6.QtCore import Qt, QRect, QPoint

from .selection_overlay import SelectionOverlay
from .pet_window import PetWindow
from .tray_app import TrayApp
from .launcher import LauncherWindow


class DesktopPetApp:
    """桌面宠物应用主类"""
    
    def __init__(self):
        self.app = QApplication(sys.argv)
        self.app.setQuitOnLastWindowClosed(False)
        
        # 创建组件
        self.overlay = SelectionOverlay()
        self.pet = PetWindow()
        self.tray = TrayApp()
        self.launcher = LauncherWindow()
        
        # 连接信号
        self._setup_signals()
    
    def _setup_signals(self):
        """设置信号连接"""
        # 启动窗口召唤
        self.launcher.summon_clicked.connect(self._on_summon)
        
        # 选择完成 -> 召唤小猫（保留矩形框方式，供后续扩展）
        self.overlay.selection_finished.connect(self._on_selection_finished)
        self.overlay.selection_cancelled.connect(self._on_selection_cancelled)
        
        # 托盘退出
        self.tray.exit_requested.connect(self._on_exit)
    
    def _on_summon(self, pos: QPoint):
        """从按钮位置召唤小猫"""
        rect = QRect(pos.x() - 50, pos.y() - 10, 100, 60)
        self.pet.appear_from_rect(rect)
    
    def _on_selection_finished(self, rect):
        """选择完成 - 召唤小猫"""
        self.pet.appear_from_rect(rect)
    
    def _on_selection_cancelled(self):
        """选择取消"""
        pass
    
    def _on_exit(self):
        """退出程序"""
        self.app.quit()
    
    def run(self):
        """运行应用"""
        # 显示启动窗口
        self.launcher.show()
        
        # 显示托盘
        self.tray.show()
        
        # 运行
        return self.app.exec()


def main():
    """程序入口"""
    app = DesktopPetApp()
    sys.exit(app.run())


if __name__ == "__main__":
    main()
