"""
Pet Window - 桌面宠物主窗口。
无边框、置顶、透明背景的小窗口，显示小猫。
支持拖动、点击互动。
"""

import random
from PySide6.QtWidgets import QWidget, QApplication
from PySide6.QtCore import Qt, QPoint, QTimer, QRect, QPropertyAnimation, QEasingCurve
from PySide6.QtGui import QMouseEvent, QPainter, QColor, QCursor

from .cat_widget import CatWidget


class PetWindow(QWidget):
    """桌面宠物窗口"""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        
        # 无边框、置顶、透明
        self.setWindowFlags(
            Qt.FramelessWindowHint |
            Qt.WindowStaysOnTopHint |
            Qt.Tool |
            Qt.WindowTransparentForInput
        )
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.setAttribute(Qt.WA_TransparentForMouseEvents, False)
        
        # 窗口大小
        self.setFixedSize(140, 160)
        
        # 猫咪控件
        self._cat = CatWidget(self)
        self._cat.move(10, 20)
        self._cat.show()
        
        # 拖动状态
        self._dragging = False
        self._drag_offset = QPoint()
        
        # 自动走动状态
        self._walking = False
        self._walk_direction = 1  # 1=右, -1=左
        self._walk_speed = 2
        
        # 走动定时器
        self._walk_timer = QTimer(self)
        self._walk_timer.timeout.connect(self._do_walk)
        
        # 随机行为定时器
        self._behavior_timer = QTimer(self)
        self._behavior_timer.timeout.connect(self._random_behavior)
        
        # 显示在屏幕中央（临时）
        screen = QApplication.primaryScreen().geometry()
        self.move(screen.center() - QPoint(70, 80))
    
    def appear_from_rect(self, rect: QRect):
        """从矩形框中出现"""
        # 计算小猫出现位置（矩形框底部中心）
        target_x = rect.center().x() - 70
        target_y = rect.bottom() - 80
        
        # 确保在屏幕内
        screen = QApplication.primaryScreen().geometry()
        target_x = max(0, min(target_x, screen.width() - 140))
        target_y = max(0, min(target_y, screen.height() - 160))
        
        # 先放在矩形框内（下方）
        self.move(target_x, target_y + 60)
        self.show()
        self.raise_()
        
        # 步骤1：探头动画
        self._cat.start_peek(rect, lambda: self._continue_jump(target_x, target_y))
    
    def _continue_jump(self, target_x, target_y):
        """探头完成后继续跳出"""
        # 步骤2：跳出动画
        self._cat.start_jump_out(lambda: self._finish_appear(target_x, target_y))
    
    def _finish_appear(self, target_x, target_y):
        """完成出现，开始走动"""
        # 移动到最终位置
        self._animate_move(target_x, target_y)
        
        # 切换到走动状态
        self._cat.start_walk()
        self._start_walking()
    
    def _animate_move(self, x, y):
        """平滑移动到目标位置"""
        # 使用QPropertyAnimation做位置动画
        self._pos_anim = QPropertyAnimation(self, b"pos")
        self._pos_anim.setDuration(300)
        self._pos_anim.setStartValue(self.pos())
        self._pos_anim.setEndValue(QPoint(x, y))
        self._pos_anim.setEasingCurve(QEasingCurve.OutQuad)
        self._pos_anim.start()
    
    def _start_walking(self):
        """开始自动走动"""
        self._walking = True
        self._walk_timer.start(50)  # 每50ms移动一次
        self._behavior_timer.start(5000)  # 每5秒随机行为
    
    def _stop_walking(self):
        """停止走动"""
        self._walking = False
        self._walk_timer.stop()
    
    def _do_walk(self):
        """执行走动"""
        if not self._walking:
            return
        
        screen = QApplication.primaryScreen().geometry()
        pos = self.pos()
        
        # 计算新位置
        new_x = pos.x() + self._walk_speed * self._walk_direction
        new_y = pos.y()
        
        # 碰到边界则转向
        if new_x <= 0:
            self._walk_direction = 1
            new_x = 0
        elif new_x >= screen.width() - 140:
            self._walk_direction = -1
            new_x = screen.width() - 140
        
        # 偶尔上下移动（模拟探索）
        if random.random() < 0.1:
            new_y += random.choice([-5, 5])
            new_y = max(0, min(new_y, screen.height() - 160))
        
        self.move(new_x, new_y)
    
    def _random_behavior(self):
        """随机行为"""
        r = random.random()
        
        if r < 0.3:
            # 改变方向
            self._walk_direction = random.choice([-1, 1])
            self._walk_speed = random.randint(1, 4)
        elif r < 0.4:
            # 暂停一下
            self._walk_speed = 0
            QTimer.singleShot(2000, lambda: setattr(self, '_walk_speed', random.randint(1, 3)))
        elif r < 0.5:
            # 跳跃一下
            self._cat.do_jump()
    
    def mousePressEvent(self, event: QMouseEvent):
        """鼠标按下 - 开始拖动或互动"""
        if event.button() == Qt.LeftButton:
            self._dragging = True
            self._drag_offset = event.pos()
            
            # 点击互动：小猫跳跃
            self._cat.do_jump()
            
            # 暂停自动走动
            self._stop_walking()
        
        elif event.button() == Qt.RightButton:
            # 右键可以打开菜单或拖动
            self._dragging = True
            self._drag_offset = event.pos()
            self._stop_walking()
    
    def mouseMoveEvent(self, event: QMouseEvent):
        """鼠标移动 - 拖动窗口"""
        if self._dragging:
            new_pos = self.mapToGlobal(event.pos()) - self._drag_offset
            self.move(new_pos)
    
    def mouseReleaseEvent(self, event: QMouseEvent):
        """鼠标释放"""
        self._dragging = False
        # 恢复走动
        self._start_walking()
    
    def enterEvent(self, event):
        """鼠标进入"""
        self.setCursor(QCursor(Qt.OpenHandCursor))
    
    def leaveEvent(self, event):
        """鼠标离开"""
        self.unsetCursor()
