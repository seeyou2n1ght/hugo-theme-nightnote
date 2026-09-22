# Nightnote

Nightnote 是一个面向个人静态博客的 Hugo 主题。视觉方向是简洁的编辑式排版与技术笔记；界面目前仅提供中文，文章内容和专题名称保持作者原文。主题负责展示与发现内容，Obsidian 笔记的选择、校验和转换由站点自己的发布流程负责。

> 当前是主题源码，尚未发布到 GitHub。仓库名建议为 `hugo-theme-nightnote`；Hugo 安装目录为 `themes/nightnote/`。

## 功能与边界

- 首页、探索页（专题、标签云、合集、时间线、随机阅读）、项目列表、文章与项目详情、About、搜索、RSS、404。
- 浅色、深色和跟随系统外观；窄屏布局、文章目录、代码复制、图片放大、阅读进度。
- Hugo 原生 Obsidian callout（包括自定义标题和 `+`/`-` 折叠）、Mermaid、KaTeX、Page Bundle 图片与封面。
- 页面、搜索和 RSS 只展示 `publishStatus: published` 且 `private: false` 的内容；主题还会拒绝渲染不符合该条件的普通页面。**发布前仍须由站点流程筛选附件和其他文件**，不能仅依赖主题模板作为隐私边界。

Mermaid 和 KaTeX 在用到时从公共 CDN 加载；默认 Open Graph 配图为 SVG，部分分享平台可能无法预览。随机阅读和搜索需要浏览器 JavaScript 与站点根目录的 `search.json`。

## 安装与配置

已在 Hugo **v0.166.0** 验证；主题声明的最低版本为 v0.166.0。将本仓库放到站点的 `themes/nightnote/`，例如：

```sh
git clone <仓库地址> themes/nightnote
```

在站点的 `hugo.yaml` 中至少配置以下内容。`theme: nightnote` 必须与安装目录同名；搜索输出及 taxonomy 路径是当前模板的约定。

```yaml
baseURL: https://blog.example.com/
title: 你的站点名称
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
params:
  intro: 一句话介绍
  focus: 关注的方向
  github: https://github.com/your-name
  email: you@example.com
```

`params.github` 和 `params.email` 可省略；配置后会显示于站点页脚及首页。站点需要提供 `content/about.md`、`content/posts/`、`content/projects/`，以及探索页对应的 `content/explore/_index.md`。导航和首页链接使用这些固定路径。

## 内容约定

文章放在 `posts`，项目放在 `projects`；建议使用 Page Bundle，将 `index.md`、封面和正文图片放在同一目录。示例 front matter：

```yaml
---
title: 示例文章
slug: example-post
published: 2026-09-22
description: 用于列表、搜索和分享的简短摘要。
private: false
publishStatus: published
category: Writing
tags: [Hugo, Obsidian]
collection: 博客建设
cover: cover.png
---
```

`category` 是单个专题，`tags` 是标签数组，`collection` 是可选合集。专题可同时包含文章与项目，仅关联项目的专题也会进入探索页和搜索索引。项目可另设 `featured: true`（首页精选）及 `links`（名称到 URL 的映射）；文章可通过 `project` 保存对应公开项目的站内 URL，用于项目页的相关文章。`slug` 应保持稳定。主题从 `published` 读取发布日期；如果站点未采用上方的 `frontmatter.date` 映射，日期和排序可能不符合预期。

主题**不负责**生成 `noteId`、验证元数据、解析 `[[双链]]` 或 `![[嵌入]]`、选择公开附件，也不直接读取整个 Obsidian 仓库。本项目的发布流程与元数据契约位于站点仓库的 `docs/PUBLISHING_WORKFLOW.md`，独立主题仓库不包含该文件；请在自己的站点建立对应流程。

## 本地验证

在本项目的示例站点根目录运行（需 Python 3 和 PyYAML）：

```sh
python scripts/prepare.py
hugo server --contentDir .build/content
python -m unittest discover -s tests -v
```

独立安装主题后，在你的**站点根目录**运行 `hugo server` 或 `hugo`；`scripts/prepare.py`、示例内容和部署配置并不包含在主题仓库中。正式发布前替换示例域名及联系信息，核查生成目录中没有私密笔记或附件。

## 许可证

主题源码采用 [MIT License](LICENSE)，允许使用、修改和分发；再分发时保留版权及许可声明。示例站点的笔记和图片不属于本主题仓库。
