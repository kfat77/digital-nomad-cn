"""
Selection Overlay - 全屏透明覆盖层，用于绘制矩形选择框。
当用户左右键同时按下并拖动时，显示此覆盖层。
"""

from PySide6.QtWidgets import QWidget, QApplication
from PySide6.QtCore import Qt, QRect, QPoint, Signal
from PySide6.QtGui import QPainter, QPen, QColor, QBrush, QFont


class SelectionOverlay(QWidget):
    """全屏矩形选择覆盖层"""
    
    # 信号：矩形选择完成
    selection_finished = Signal(QRect)
    # 信号：取消选择
    selection_cancelled = Signal()
    
    def __init__(self, parent=None):
        super().__init__(parent)
        
        # 设置全屏透明窗口
        self.setWindowFlags(
            Qt.FramelessWindowHint |
            Qt.WindowStaysOnTopHint |
            Qt.Tool |
            Qt.WindowTransparentForInput  # 让鼠标事件穿透？不，我们需要捕获
        )
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.setAttribute(Qt.WA_TransparentForMouseEvents, False)
        
        # 获取屏幕尺寸
        screen = QApplication.primaryScreen().geometry()
        self.setGeometry(screen)
        
        # 选择状态
        self._selecting = False
        self._start_pos = QPoint()
        self._current_pos = QPoint()
        
        # 样式
        self.border_color = QColor(255, 200, 50, 220)  # 金黄色边框
        self.fill_color = QColor(255, 230, 100, 40)    # 淡黄填充
        self.dash_pen = QPen(self.border_color, 2, Qt.DashLine)
        self.solid_pen = QPen(self.border_color, 2, Qt.SolidLine)
        
        self._show_hint = True
        self._hint_timer = None
    
    def start_selection(self, start_pos: QPoint):
        """开始新的选择"""
        self._selecting = True
        self._start_pos = start_pos
        self._current_pos = start_pos
        self._show_hint = True
        self.show()
        self.raise_()
        self.activateWindow()
        
        # 2秒后隐藏提示
        from PySide6.QtCore import QTimer
        self._hint_timer = QTimer(self)
        self._hint_timer.setSingleShot(True)
        self._hint_timer.timeout.connect(self._hide_hint)
        self._hint_timer.start(2000)
    
    def _hide_hint(self):
        self._show_hint = False
        self.update()
    
    def update_position(self, current_pos: QPoint):
        """更新当前位置（鼠标移动时）"""
        if self._selecting:
            self._current_pos = current_pos
            self.update()
    
    def finish_selection(self, end_pos: QPoint):
        """完成选择"""
        if not self._selecting:
            return
        
        self._selecting = False
        self._current_pos = end_pos
        
        # 计算矩形（确保左上角是起点）
        rect = QRect(self._start_pos, self._current_pos).normalized()
        
        self.hide()
        
        # 如果矩形足够大，发送信号
        if rect.width() > 20 and rect.height() > 20:
            self.selection_finished.emit(rect)
        else:
            self.selection_cancelled.emit()
    
    def cancel_selection(self):
        """取消选择"""
        self._selecting = False
        self.hide()
        self.selection_cancelled.emit()
    
    def get_selection_rect(self) -> QRect:
        """获取当前选择矩形"""
        if self._selecting:
            return QRect(self._start_pos, self._current_pos).normalized()
        return QRect()
    
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # 绘制半透明遮罩（非选中区域）
        screen_rect = self.rect()
        if self._selecting:
            selection = QRect(self._start_pos, self._current_pos).normalized()
            
            # 绘制暗色遮罩（全屏减去选中区域）
            mask_color = QColor(0, 0, 0, 80)
            
            # 上方
            if selection.top() > screen_rect.top():
                painter.fillRect(
                    screen_rect.left(), screen_rect.top(),
                    screen_rect.width(), selection.top() - screen_rect.top(),
                    mask_color
                )
            # 下方
            if selection.bottom() < screen_rect.bottom():
                painter.fillRect(
                    screen_rect.left(), selection.bottom() + 1,
                    screen_rect.width(), screen_rect.bottom() - selection.bottom(),
                    mask_color
                )
            # 左侧
            if selection.left() > screen_rect.left():
                painter.fillRect(
                    screen_rect.left(), selection.top(),
                    selection.left() - screen_rect.left(), selection.height(),
                    mask_color
                )
            # 右侧
            if selection.right() < screen_rect.right():
                painter.fillRect(
                    selection.right() + 1, selection.top(),
                    screen_rect.right() - selection.right(), selection.height(),
                    mask_color
                )
            
            # 绘制选中区域边框
            painter.setPen(self.dash_pen)
            painter.drawRect(selection)
            
            # 绘制选中区域填充
            painter.fillRect(selection, self.fill_color)
            
            # 绘制四个角的抓手
            self._draw_handles(painter, selection)
            
            # 绘制尺寸信息
            self._draw_size_info(painter, selection)
            
            # 绘制提示文字
            if self._show_hint:
                self._draw_hint(painter)
    
    def _draw_handles(self, painter: QPainter, rect: QRect):
        """绘制矩形四角的抓手"""
        handle_size = 8
        handle_color = QColor(255, 255, 255)
        handle_pen = QPen(handle_color, 2)
        painter.setPen(handle_pen)
        
        corners = [
            rect.topLeft(), rect.topRight(),
            rect.bottomLeft(), rect.bottomRight()
        ]
        
        for corner in corners:
            painter.drawRect(
                corner.x() - handle_size // 2,
                corner.y() - handle_size // 2,
                handle_size, handle_size
            )
    
    def _draw_size_info(self, painter: QPainter, rect: QRect):
        """绘制矩形尺寸"""
        font = QFont("Microsoft YaHei", 10)
        painter.setFont(font)
        painter.setPen(QPen(Qt.white))
        
        text = f"{rect.width()} x {rect.height()}"
        metrics = painter.fontMetrics()
        text_w = metrics.horizontalAdvance(text)
        text_x = rect.center().x() - text_w // 2
        text_y = rect.center().y() + 5
        
        # 背景
        padding = 4
        bg_rect = QRect(
            text_x - padding, text_y - metrics.height() + 2,
            text_w + padding * 2, metrics.height() + 4
        )
        painter.fillRect(bg_rect, QColor(0, 0, 0, 150))
        painter.drawText(text_x, text_y, text)
    
    def _draw_hint(self, painter: QPainter):
        """绘制提示文字"""
        screen = self.rect()
        font = QFont("Microsoft YaHei", 12, QFont.Bold)
        painter.setFont(font)
        painter.setPen(QPen(Qt.white))
        
        hint = "✨ 继续拖动调整矩形大小，松开鼠标召唤小猫！"
        metrics = painter.fontMetrics()
        text_w = metrics.horizontalAdvance(hint)
        
        # 背景
        padding = 10
        x = (screen.width() - text_w) // 2
        y = screen.height() // 4
        bg_rect = QRect(
            x - padding, y - metrics.height() - 5,
            text_w + padding * 2, metrics.height() + 15
        )
        painter.fillRect(bg_rect, QColor(0, 0, 0, 160))
        painter.drawText(x, y, hint)
