"""
Cat Widget - 绘制可爱的小猫，包含各种动画效果。
使用 QPainter 绘制，无需外部图片资源。
"""

import math
from PySide6.QtWidgets import QWidget
from PySide6.QtCore import Qt, QTimer, QPoint, QSize, QPropertyAnimation, QEasingCurve, Property
from PySide6.QtGui import QPainter, QBrush, QColor, QPen, QFont, QPainterPath, QFontMetrics


class CatWidget(QWidget):
    """小猫控件，包含绘制和动画逻辑"""
    
    # 动画状态
    STATE_IDLE = 0
    STATE_PEEK = 1      # 探头
    STATE_JUMP_OUT = 2  # 跳出
    STATE_WALK = 3      # 走动
    STATE_JUMP = 4      # 点击跳跃
    STATE_MEOW = 5      # 叫唤
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setFixedSize(120, 120)
        self.setAttribute(Qt.WA_TranslucentBackground)
        
        # 动画状态
        self._state = self.STATE_IDLE
        self._peek_progress = 0.0       # 探头进度 0-1
        self._jump_progress = 0.0       # 跳出进度 0-1
        self._walk_offset = 0.0         # 走路偏移
        self._blink_closed = False      # 眨眼状态
        self._meow_text = ""            # 喵文字
        self._meow_alpha = 0            # 文字透明度
        self._tail_angle = 0.0          # 尾巴角度
        
        # 猫咪颜色
        self.cat_color = QColor(255, 183, 77)       # 橘色
        self.cat_dark = QColor(245, 166, 35)        # 深橘色
        self.ear_inner = QColor(255, 205, 128)      # 耳朵内色
        self.eye_color = QColor(60, 40, 20)         # 眼睛颜色
        self.nose_color = QColor(255, 130, 140)     # 粉色鼻子
        self.whisker_color = QColor(80, 60, 40)     # 胡须颜色
        
        # 动画定时器
        self._timer = QTimer(self)
        self._timer.timeout.connect(self._update_animation)
        self._timer.start(30)  # 33fps
        
        # 眨眼定时器
        self._blink_timer = QTimer(self)
        self._blink_timer.timeout.connect(self._do_blink)
        self._blink_timer.start(3000)  # 每3秒眨眼
        
        # 尾巴摆动定时器
        self._tail_timer = QTimer(self)
        self._tail_timer.timeout.connect(self._update_tail)
        self._tail_timer.start(100)
        
        self._tail_direction = 1
        self._walk_phase = 0
        
    # ===== 属性动画 =====
    def _get_peek(self):
        return self._peek_progress
    
    def _set_peek(self, value):
        self._peek_progress = value
        self.update()
    
    peek_progress = Property(float, _get_peek, _set_peek)
    
    def _get_jump(self):
        return self._jump_progress
    
    def _set_jump(self, value):
        self._jump_progress = value
        self.update()
    
    jump_progress = Property(float, _get_jump, _set_jump)
    
    # ===== 动画控制 =====
    def start_peek(self, from_rect, callback=None):
        """开始探头动画，从矩形框边缘探出"""
        self._state = self.STATE_PEEK
        self._peek_progress = 0.0
        
        self._anim = QPropertyAnimation(self, b"peek_progress")
        self._anim.setDuration(800)
        self._anim.setStartValue(0.0)
        self._anim.setEndValue(1.0)
        self._anim.setEasingCurve(QEasingCurve.OutBack)
        if callback:
            self._anim.finished.connect(callback)
        self._anim.start()
    
    def start_jump_out(self, callback=None):
        """开始跳出动画"""
        self._state = self.STATE_JUMP_OUT
        self._jump_progress = 0.0
        
        self._anim = QPropertyAnimation(self, b"jump_progress")
        self._anim.setDuration(600)
        self._anim.setStartValue(0.0)
        self._anim.setEndValue(1.0)
        self._anim.setEasingCurve(QEasingCurve.OutBounce)
        if callback:
            self._anim.finished.connect(callback)
        self._anim.start()
    
    def start_walk(self):
        """切换到走路/idle状态"""
        self._state = self.STATE_WALK
        self._peek_progress = 0.0
        self._jump_progress = 0.0
        self.update()
    
    def do_jump(self):
        """被点击时的跳跃"""
        if self._state == self.STATE_JUMP:
            return
        self._state = self.STATE_JUMP
        self._jump_progress = 0.0
        
        self._anim = QPropertyAnimation(self, b"jump_progress")
        self._anim.setDuration(500)
        self._anim.setStartValue(0.0)
        self._anim.setEndValue(1.0)
        self._anim.setEasingCurve(QEasingCurve.OutBounce)
        self._anim.finished.connect(self._jump_finished)
        self._anim.start()
        
        # 同时显示"喵"
        self._show_meow()
    
    def _jump_finished(self):
        self._state = self.STATE_WALK
        self._jump_progress = 0.0
        self.update()
    
    def _show_meow(self):
        """显示喵文字"""
        self._meow_text = "喵~"
        self._meow_alpha = 255
        self._meow_timer = QTimer(self)
        self._meow_timer.timeout.connect(self._fade_meow)
        self._meow_timer.start(50)
        self._meow_ticks = 0
    
    def _fade_meow(self):
        self._meow_ticks += 1
        self._meow_alpha = max(0, 255 - self._meow_ticks * 12)
        if self._meow_alpha <= 0:
            self._meow_timer.stop()
            self._meow_text = ""
        self.update()
    
    def _do_blink(self):
        """眨眼"""
        self._blink_closed = True
        self.update()
        QTimer.singleShot(150, self._open_eyes)
    
    def _open_eyes(self):
        self._blink_closed = False
        self.update()
    
    def _update_tail(self):
        """更新尾巴摆动"""
        self._tail_angle += 15 * self._tail_direction
        if abs(self._tail_angle) > 30:
            self._tail_direction *= -1
        self.update()
    
    def _update_animation(self):
        """主动画更新循环"""
        if self._state == self.STATE_WALK:
            self._walk_phase += 1
            self.update()
    
    # ===== 绘制 =====
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # 根据状态选择绘制方式
        if self._state == self.STATE_PEEK:
            self._draw_peek(painter)
        elif self._state == self.STATE_JUMP_OUT:
            self._draw_jump_out(painter)
        elif self._state == self.STATE_JUMP:
            self._draw_click_jump(painter)
        else:
            self._draw_full_cat(painter)
        
        # 绘制喵文字
        if self._meow_text and self._meow_alpha > 0:
            self._draw_meow(painter)
    
    def _draw_peek(self, painter: QPainter):
        """探头动画 - 从下方升起"""
        progress = self._peek_progress
        
        # 计算偏移：从底部升起
        start_y = 120  # 完全在下方
        end_y = 0
        current_y = start_y + (end_y - start_y) * progress
        
        painter.save()
        painter.translate(0, current_y)
        
        # 只绘制头部上方部分，营造"从框中探出"的感觉
        # 实际上绘制完整猫，但通过裁剪或位置控制效果
        self._draw_full_cat(painter, peek=True, peek_progress=progress)
        
        painter.restore()
    
    def _draw_jump_out(self, painter: QPainter):
        """跳出动画 - 弹跳效果"""
        progress = self._jump_progress
        
        # 向上跳然后落下
        jump_height = -60 * math.sin(progress * math.pi)  # 负值向上
        
        painter.save()
        painter.translate(0, jump_height)
        self._draw_full_cat(painter, squash=(1.0 - progress * 0.3))
        painter.restore()
    
    def _draw_click_jump(self, painter: QPainter):
        """点击跳跃"""
        progress = self._jump_progress
        jump_height = -40 * math.sin(progress * math.pi)
        
        painter.save()
        painter.translate(0, jump_height)
        self._draw_full_cat(painter)
        painter.restore()
    
    def _draw_full_cat(self, painter: QPainter, peek=False, peek_progress=1.0, squash=1.0):
        """绘制完整的小猫"""
        cx, cy = 60, 60
        
        # 身体缩放
        painter.save()
        painter.translate(cx, cy + 30)
        painter.scale(1.0, squash)
        painter.translate(-cx, -(cy + 30))
        
        # 绘制尾巴
        self._draw_tail(painter, cx, cy)
        
        # 绘制身体（椭圆形）
        body_h = 35 * squash
        body_path = QPainterPath()
        body_path.addEllipse(QPoint(cx, cy + 30), 30, int(body_h))
        painter.fillPath(body_path, QBrush(self.cat_color))
        
        # 肚皮（浅色）
        belly_path = QPainterPath()
        belly_path.addEllipse(QPoint(cx, cy + 32), 18, int(body_h * 0.6))
        painter.fillPath(belly_path, QBrush(self.ear_inner))
        
        # 绘制左右脚
        foot_w, foot_h = 12, 8
        painter.fillRect(int(cx - 22), int(cy + 55), foot_w, foot_h, self.cat_dark)
        painter.fillRect(int(cx + 10), int(cy + 55), foot_w, foot_h, self.cat_dark)
        
        painter.restore()  # 恢复身体缩放
        
        # 绘制猫头（不受身体缩放影响）
        self._draw_head(painter, cx, cy)
    
    def _draw_head(self, painter: QPainter, cx, cy):
        """绘制猫头"""
        head_r = 35
        
        # 主头圆
        head_path = QPainterPath()
        head_path.addEllipse(QPoint(cx, cy), head_r, head_r)
        painter.fillPath(head_path, QBrush(self.cat_color))
        
        # 耳朵（三角形）
        ear_size = 20
        ear_offset = 22
        
        # 左耳
        left_ear = QPainterPath()
        left_ear.moveTo(cx - ear_offset, cy - head_r + 10)
        left_ear.lineTo(cx - ear_offset - ear_size, cy - head_r - ear_size + 10)
        left_ear.lineTo(cx - ear_offset + 8, cy - head_r + 5)
        left_ear.closeSubpath()
        painter.fillPath(left_ear, QBrush(self.cat_color))
        # 左耳内
        left_ear_inner = QPainterPath()
        left_ear_inner.moveTo(cx - ear_offset, cy - head_r + 12)
        left_ear_inner.lineTo(cx - ear_offset - ear_size + 5, cy - head_r - ear_size + 18)
        left_ear_inner.lineTo(cx - ear_offset + 5, cy - head_r + 8)
        left_ear_inner.closeSubpath()
        painter.fillPath(left_ear_inner, QBrush(self.ear_inner))
        
        # 右耳
        right_ear = QPainterPath()
        right_ear.moveTo(cx + ear_offset, cy - head_r + 10)
        right_ear.lineTo(cx + ear_offset + ear_size, cy - head_r - ear_size + 10)
        right_ear.lineTo(cx + ear_offset - 8, cy - head_r + 5)
        right_ear.closeSubpath()
        painter.fillPath(right_ear, QBrush(self.cat_color))
        # 右耳内
        right_ear_inner = QPainterPath()
        right_ear_inner.moveTo(cx + ear_offset, cy - head_r + 12)
        right_ear_inner.lineTo(cx + ear_offset + ear_size - 5, cy - head_r - ear_size + 18)
        right_ear_inner.lineTo(cx + ear_offset - 5, cy - head_r + 8)
        right_ear_inner.closeSubpath()
        painter.fillPath(right_ear_inner, QBrush(self.ear_inner))
        
        # 条纹（头顶）
        stripe_pen = QPen(self.cat_dark)
        stripe_pen.setWidth(3)
        stripe_pen.setCapStyle(Qt.RoundCap)
        painter.setPen(stripe_pen)
        for dx in [-8, 0, 8]:
            painter.drawLine(cx + dx, cy - head_r + 15, cx + dx, cy - 5)
        
        # 眼睛
        self._draw_eyes(painter, cx, cy)
        
        # 鼻子
        nose_path = QPainterPath()
        nose_path.moveTo(cx - 5, cy + 5)
        nose_path.lineTo(cx + 5, cy + 5)
        nose_path.lineTo(cx, cy + 12)
        nose_path.closeSubpath()
        painter.fillPath(nose_path, QBrush(self.nose_color))
        
        # 嘴巴
        mouth_pen = QPen(QColor(80, 60, 40))
        mouth_pen.setWidth(2)
        painter.setPen(mouth_pen)
        painter.drawLine(cx, cy + 12, cx - 6, cy + 18)
        painter.drawLine(cx, cy + 12, cx + 6, cy + 18)
        
        # 胡须
        self._draw_whiskers(painter, cx, cy)
        
        # 腮红
        blush = QColor(255, 180, 180, 80)
        painter.fillEllipse(cx - 28, cy + 2, 12, 8, QBrush(blush))
        painter.fillEllipse(cx + 16, cy + 2, 12, 8, QBrush(blush))
    
    def _draw_eyes(self, painter: QPainter, cx, cy):
        """绘制眼睛"""
        if self._blink_closed:
            # 闭眼 - 弧线
            pen = QPen(self.eye_color)
            pen.setWidth(3)
            painter.setPen(pen)
            painter.drawArc(cx - 20, cy - 8, 16, 10, 0, 180 * 16)
            painter.drawArc(cx + 4, cy - 8, 16, 10, 0, 180 * 16)
        else:
            # 睁眼 - 圆形 + 瞳孔 + 高光
            # 左眼白
            painter.fillEllipse(cx - 18, cy - 10, 14, 16, QBrush(Qt.white))
            # 右眼白
            painter.fillEllipse(cx + 4, cy - 10, 14, 16, QBrush(Qt.white))
            
            # 瞳孔
            painter.fillEllipse(cx - 14, cy - 6, 8, 10, QBrush(self.eye_color))
            painter.fillEllipse(cx + 8, cy - 6, 8, 10, QBrush(self.eye_color))
            
            # 高光
            painter.fillEllipse(cx - 12, cy - 4, 3, 4, QBrush(Qt.white))
            painter.fillEllipse(cx + 10, cy - 4, 3, 4, QBrush(Qt.white))
    
    def _draw_whiskers(self, painter: QPainter, cx, cy):
        """绘制胡须"""
        pen = QPen(self.whisker_color)
        pen.setWidth(1)
        painter.setPen(pen)
        
        # 左边胡须
        painter.drawLine(cx - 25, cy + 8, cx - 45, cy + 5)
        painter.drawLine(cx - 25, cy + 12, cx - 45, cy + 12)
        painter.drawLine(cx - 25, cy + 16, cx - 45, cy + 19)
        
        # 右边胡须
        painter.drawLine(cx + 25, cy + 8, cx + 45, cy + 5)
        painter.drawLine(cx + 25, cy + 12, cx + 45, cy + 12)
        painter.drawLine(cx + 25, cy + 16, cx + 45, cy + 19)
    
    def _draw_tail(self, painter: QPainter, cx, cy):
        """绘制尾巴"""
        tail_pen = QPen(self.cat_dark)
        tail_pen.setWidth(6)
        tail_pen.setCapStyle(Qt.RoundCap)
        painter.setPen(tail_pen)
        
        angle = math.radians(self._tail_angle + 180)
        tip_x = cx + int(40 * math.sin(angle))
        tip_y = cy + int(40 * math.cos(angle)) + 20
        
        # 贝塞尔曲线尾巴
        path = QPainterPath()
        path.moveTo(cx + 25, cy + 40)
        path.quadTo(cx + 45, cy + 50, tip_x, tip_y)
        painter.drawPath(path)
    
    def _draw_meow(self, painter: QPainter):
        """绘制喵文字"""
        font = QFont("Microsoft YaHei", 14, QFont.Bold)
        painter.setFont(font)
        color = QColor(255, 100, 100, self._meow_alpha)
        painter.setPen(color)
        
        # 文字在小猫上方
        text = self._meow_text
        metrics = QFontMetrics(font)
        text_w = metrics.horizontalAdvance(text)
        painter.drawText((120 - text_w) // 2, 20, text)
