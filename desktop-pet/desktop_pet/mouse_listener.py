"""
Mouse Listener - 全局鼠标事件监听。
检测鼠标左右键同时按下并拖动，触发矩形选择。
使用 pynput 实现跨平台全局鼠标监听。
"""

import threading
from pynput import mouse
from PySide6.QtCore import QObject, Signal, QPoint


class MouseListener(QObject):
    """全局鼠标监听器，运行在独立线程中"""
    
    # 信号：左键按下（带位置）
    left_pressed = Signal(QPoint)
    # 信号：左键释放（带位置）
    left_released = Signal(QPoint)
    # 信号：右键按下
    right_pressed = Signal(QPoint)
    # 信号：右键释放
    right_released = Signal(QPoint)
    # 信号：鼠标移动
    mouse_moved = Signal(QPoint)
    # 信号：左右键同时按下（开始拖拽）
    both_pressed = Signal(QPoint)
    # 信号：任意键释放（结束拖拽）
    any_released = Signal(QPoint)
    
    def __init__(self, parent=None):
        super().__init__(parent)
        
        # 按键状态
        self._left_down = False
        self._right_down = False
        self._both_active = False  # 左右键同时按下状态
        
        # 当前鼠标位置
        self._current_pos = QPoint(0, 0)
        
        # 监听器
        self._listener = None
        self._running = False
    
    def start(self):
        """启动鼠标监听"""
        if self._running:
            return
        
        self._running = True
        
        # 在独立线程中运行监听器
        def run_listener():
            self._listener = mouse.Listener(
                on_click=self._on_click,
                on_move=self._on_move
            )
            self._listener.start()
            self._listener.join()
        
        self._thread = threading.Thread(target=run_listener, daemon=True)
        self._thread.start()
    
    def stop(self):
        """停止鼠标监听"""
        self._running = False
        if self._listener:
            self._listener.stop()
    
    def _on_click(self, x, y, button, pressed):
        """鼠标点击回调"""
        pos = QPoint(int(x), int(y))
        self._current_pos = pos
        
        if button == mouse.Button.left:
            self._left_down = pressed
            if pressed:
                self.left_pressed.emit(pos)
            else:
                self.left_released.emit(pos)
        
        elif button == mouse.Button.right:
            self._right_down = pressed
            if pressed:
                self.right_pressed.emit(pos)
            else:
                self.right_released.emit(pos)
        
        # 检查左右键同时按下
        if self._left_down and self._right_down and not self._both_active:
            self._both_active = True
            self.both_pressed.emit(pos)
        
        # 如果任意键释放，且之前是同时按下状态
        if not pressed and self._both_active:
            # 检查是否两个都释放了
            if not self._left_down or not self._right_down:
                self._both_active = False
                self.any_released.emit(pos)
    
    def _on_move(self, x, y):
        """鼠标移动回调"""
        pos = QPoint(int(x), int(y))
        self._current_pos = pos
        self.mouse_moved.emit(pos)
