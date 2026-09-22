# Nightnote

Nightnote 是面向 Obsidian 笔记的 Hugo 个人博客主题，采用简洁的编辑式排版。界面目前为中文，支持文章、项目、专题、标签云、合集、时间线、搜索、随机阅读与明暗外观。主题只负责呈现；公开内容的选择、双链与附件转换应由站点的发布流程完成。

本仓库名为 [`hugo-theme-nightbook`](https://github.com/seeyou2n1ght/hugo-theme-nightbook)，主题展示名和 Hugo 安装目录仍为 **Nightnote / `nightnote`**。已使用 Hugo v0.166.0 验证，最低版本为 v0.166.0。

## 安装与使用

在 Hugo 站点根目录安装主题：

```sh
git clone https://github.com/seeyou2n1ght/hugo-theme-nightbook.git themes/nightnote
```

`hugo.yaml` 至少需要以下配置。搜索与随机阅读依赖 `search.json`；数学公式使用下方的 Goldmark passthrough 配置。

```yaml
baseURL: https://blog.example.com/
title: 我的博客
defaultContentLanguage: zh
languages:
  zh:
    locale: zh-CN
theme: nightnote
frontmatter:
  date: [published, date]
taxonomies:
  category: category
  tag: tags
  collection: collection
permalinks:
  posts: /posts/:slug/
  projects: /projects/:slug/
  taxonomy:
    category: /topics/
    collection: /collections/
  term:
    category: /topics/:slug/
    collection: /collections/:slug/
outputs:
  home: [HTML, RSS, Search]
outputFormats:
  Search:
    mediaType: application/json
    baseName: search
    isPlainText: true
    notAlternative: true
markup:
  goldmark:
    extensions:
      passthrough:
        enable: true
        delimiters:
          block: [['$$', '$$']]
          inline: [['$', '$']]
```

站点内容放在 `content/posts/`、`content/projects/`，并提供 `content/about.md` 和 `content/explore/_index.md`。可选的 `params.intro`、`params.focus`、`params.github`、`params.email` 分别用于首页简介、关注方向和联系链接。配置完成后，在站点根目录运行 `hugo server` 预览，运行 `hugo` 构建静态文件。

## 元数据约束

下面是文章示例；项目放在 `projects` 并将 `noteType` 设为 `project`。图片建议与 `index.md` 放在同一个 Page Bundle 中。

```yaml
---
title: 示例文章
noteId: c6f18e3e-a9a0-45a3-a1f9-5eed03f8e1c9
slug: example-post
noteType: note
private: false
publishStatus: published
published: 2026-09-22
description: 一句话摘要
category: Writing
tags: [Hugo, Obsidian]
collection: 博客建设 # 可选
cover: cover.png # 可选
---
```

主题仅展示 `private: false` 且 `publishStatus: published` 的普通页面，并从 `published` 读取日期。`category` 是单个专题，可同时关联文章与项目；`tags` 是数组，`collection` 是可选合集。项目还可使用 `featured: true` 和 `links`；文章可用 `project` 保存关联项目的站内 URL。`noteId` 用于 Obsidian 发布流程识别笔记更新，主题本身不使用它。

**主题不是发布闸门。** 发布前须在站点侧校验元数据、筛选公开笔记与附件，并处理 Obsidian 双链；不要直接把完整笔记仓库交给 Hugo。Mermaid 和 KaTeX 按需从公共 CDN 加载，默认 Open Graph 配图为 SVG。

## 许可证

主题源码采用 [MIT License](LICENSE)。示例站点的笔记和图片不包含在本仓库中。
