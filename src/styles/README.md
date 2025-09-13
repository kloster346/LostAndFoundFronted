# 样式系统说明文档

本项目采用了完整的CSS样式系统，提供统一的视觉风格和良好的用户体验。

## 文件结构

```
src/styles/
├── variables.css    # CSS变量定义
├── global.css      # 全局样式和工具类
├── layout.css      # 响应式布局系统
├── components.css  # 组件样式
├── themes.css      # 主题切换样式
└── README.md       # 本说明文档
```

## 使用方法

### 1. 引入样式

样式系统已在 `main.js` 中全局引入：

```javascript
import './styles/global.css'
```

### 2. CSS变量使用

所有设计令牌都定义为CSS变量，可以在任何地方使用：

```css
.my-component {
  color: var(--text-primary);
  background: var(--bg-color);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-base);
}
```

### 3. 工具类使用

提供了丰富的工具类，可以快速构建界面：

```html
<!-- 文本样式 -->
<div class="text-primary font-medium text-lg">标题文本</div>
<div class="text-secondary text-sm">描述文本</div>

<!-- 布局 -->
<div class="flex items-center justify-between">
  <div class="flex-1">内容</div>
  <div class="ml-md">操作</div>
</div>

<!-- 间距 -->
<div class="p-lg m-md">带间距的容器</div>

<!-- 响应式 -->
<div class="col-12 col-md-6 col-lg-4">响应式列</div>
```

## 设计令牌

### 颜色系统

#### 主色调
- `--primary-color`: 主品牌色 (#409EFF)
- `--primary-light`: 主色浅色版
- `--primary-dark`: 主色深色版

#### 功能色
- `--success-color`: 成功色 (#67C23A)
- `--warning-color`: 警告色 (#E6A23C)
- `--danger-color`: 危险色 (#F56C6C)
- `--info-color`: 信息色 (#909399)

#### 中性色
- `--text-primary`: 主要文本色
- `--text-regular`: 常规文本色
- `--text-secondary`: 次要文本色
- `--text-placeholder`: 占位符文本色
- `--text-disabled`: 禁用文本色

#### 背景色
- `--bg-page`: 页面背景色
- `--bg-color`: 组件背景色
- `--bg-color-light`: 浅色背景
- `--bg-color-lighter`: 更浅背景

#### 边框色
- `--border-base`: 基础边框色
- `--border-light`: 浅色边框
- `--border-lighter`: 更浅边框
- `--border-extra-light`: 极浅边框

### 字体系统

#### 字体族
- `--font-family`: 系统字体栈

#### 字体大小
- `--font-size-extra-small`: 10px
- `--font-size-small`: 12px
- `--font-size-base`: 14px (基准)
- `--font-size-medium`: 16px
- `--font-size-large`: 18px
- `--font-size-extra-large`: 20px

#### 字体粗细
- `--font-weight-light`: 300
- `--font-weight-normal`: 400
- `--font-weight-medium`: 500
- `--font-weight-bold`: 600
- `--font-weight-bolder`: 700

#### 行高
- `--line-height-small`: 1.2
- `--line-height-base`: 1.5
- `--line-height-large`: 1.8

### 间距系统

- `--spacing-xs`: 4px
- `--spacing-sm`: 8px
- `--spacing-md`: 16px (基准)
- `--spacing-lg`: 24px
- `--spacing-xl`: 32px
- `--spacing-xxl`: 48px

### 圆角系统

- `--border-radius-small`: 2px
- `--border-radius-base`: 4px (基准)
- `--border-radius-large`: 8px
- `--border-radius-circle`: 50%

### 阴影系统

- `--shadow-light`: 轻微阴影
- `--shadow-base`: 基础阴影
- `--shadow-dark`: 深色阴影

### 动画系统

- `--transition-duration`: 0.3s
- `--transition-base`: 基础过渡
- `--transition-color`: 颜色过渡
- `--transition-border`: 边框过渡
- `--transition-box-shadow`: 阴影过渡

## 响应式布局

### 断点定义

- **小屏幕 (手机)**: < 768px
- **中等屏幕 (平板)**: 768px - 991px
- **大屏幕 (桌面)**: 992px - 1199px
- **超大屏幕**: ≥ 1200px

### 网格系统

采用12列网格系统：

```html
<div class="row">
  <div class="col-12 col-md-6 col-lg-4">列1</div>
  <div class="col-12 col-md-6 col-lg-4">列2</div>
  <div class="col-12 col-md-12 col-lg-4">列3</div>
</div>
```

### 响应式工具类

```html
<!-- 在小屏幕隐藏，大屏幕显示 -->
<div class="sm:hidden lg:block">内容</div>

<!-- 响应式文本对齐 -->
<div class="text-center md:text-left">文本</div>
```

## 组件样式

### 按钮组件

```html
<!-- 基础按钮 -->
<button class="btn btn-primary">主要按钮</button>
<button class="btn btn-secondary">次要按钮</button>
<button class="btn btn-success">成功按钮</button>
<button class="btn btn-warning">警告按钮</button>
<button class="btn btn-danger">危险按钮</button>

<!-- 按钮尺寸 -->
<button class="btn btn-primary btn-sm">小按钮</button>
<button class="btn btn-primary">默认按钮</button>
<button class="btn btn-primary btn-lg">大按钮</button>

<!-- 块级按钮 -->
<button class="btn btn-primary btn-block">块级按钮</button>
```

### 表单组件

```html
<div class="form-group">
  <label class="form-label required">用户名</label>
  <input type="text" class="form-control" placeholder="请输入用户名">
  <div class="form-help">用户名长度为3-20个字符</div>
</div>
```

### 卡片组件

```html
<div class="card">
  <div class="card-header">卡片标题</div>
  <div class="card-body">
    <p>卡片内容</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">操作</button>
  </div>
</div>
```

### 标签组件

```html
<span class="tag tag-primary">主要标签</span>
<span class="tag tag-success">成功标签</span>
<span class="tag tag-warning">警告标签</span>
<span class="tag tag-danger">危险标签</span>
```

## 主题系统

### 主题切换

系统支持浅色和深色主题，可以通过以下方式切换：

```javascript
// 切换到深色主题
document.documentElement.classList.add('dark-theme')

// 切换到浅色主题
document.documentElement.classList.remove('dark-theme')
document.documentElement.classList.add('light-theme')

// 跟随系统主题
document.documentElement.classList.remove('dark-theme', 'light-theme')
```

### 主题切换按钮

```html
<button class="theme-toggle" onclick="toggleTheme()">
  <div class="theme-toggle-slider">
    <span class="theme-icon-sun">☀️</span>
    <span class="theme-icon-moon">🌙</span>
  </div>
</button>
```

### 系统主题检测

系统会自动检测用户的系统主题偏好：

```css
@media (prefers-color-scheme: dark) {
  /* 自动应用深色主题 */
}
```

## 最佳实践

### 1. 使用设计令牌

❌ 不推荐：
```css
.my-component {
  color: #303133;
  font-size: 14px;
  padding: 16px;
}
```

✅ 推荐：
```css
.my-component {
  color: var(--text-primary);
  font-size: var(--font-size-base);
  padding: var(--spacing-md);
}
```

### 2. 优先使用工具类

❌ 不推荐：
```css
.my-component {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
```

✅ 推荐：
```html
<div class="flex items-center justify-between mb-md">
  <!-- 内容 -->
</div>
```

### 3. 响应式设计

❌ 不推荐：
```css
.my-component {
  width: 300px;
}
```

✅ 推荐：
```html
<div class="col-12 col-md-6 col-lg-4">
  <!-- 内容 -->
</div>
```

### 4. 主题兼容

确保自定义样式在不同主题下都能正常显示：

```css
.my-component {
  background: var(--bg-color);
  color: var(--text-primary);
  border: 1px solid var(--border-base);
}
```

### 5. 无障碍支持

考虑用户的无障碍需求：

```css
@media (prefers-reduced-motion: reduce) {
  .my-component {
    transition: none;
  }
}

@media (prefers-contrast: high) {
  .my-component {
    border-width: 2px;
  }
}
```

## 扩展指南

### 添加新的设计令牌

在 `variables.css` 中添加新的CSS变量：

```css
:root {
  /* 新的颜色 */
  --brand-color: #ff6b6b;
  --brand-light: #ff8e8e;
  --brand-dark: #ff4757;
}
```

### 创建新的组件样式

在 `components.css` 中添加新的组件样式：

```css
/* 新组件样式 */
.my-new-component {
  background: var(--bg-color);
  border: 1px solid var(--border-base);
  border-radius: var(--border-radius-base);
  padding: var(--spacing-md);
}
```

### 添加新的工具类

在 `global.css` 中添加新的工具类：

```css
/* 新工具类 */
.text-brand { color: var(--brand-color); }
.bg-brand { background-color: var(--brand-color); }
.border-brand { border-color: var(--brand-color); }
```

## 注意事项

1. **保持一致性**：使用统一的设计令牌和命名规范
2. **响应式优先**：确保所有组件在不同屏幕尺寸下都能正常显示
3. **主题兼容**：新增样式要考虑深色主题的兼容性
4. **性能优化**：避免过度嵌套和重复的样式定义
5. **无障碍支持**：考虑视觉障碍用户的使用需求
6. **浏览器兼容**：确保样式在主流浏览器中正常显示

## 更新日志

- **v1.0.0** (2024-01-XX)
  - 初始版本发布
  - 完整的设计令牌系统
  - 响应式布局系统
  - 组件样式库
  - 主题切换功能
  - 工具类集合