import subprocess
import tempfile
import unittest
import json
import re
from pathlib import Path


class ThemeTest(unittest.TestCase):
    def test_standalone_example_under_subpath(self):
        root = Path(__file__).resolve().parents[1]
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary) / "public"
            subprocess.run(
                ["hugo", "--source", str(root / "exampleSite"),
                 "--themesDir", str(root.parent), "--theme", root.name,
                 "--baseURL", "https://example.org/preview/", "--minify",
                 "--destination", str(output)],
                check=True, capture_output=True,
            )
            for page in ("index.html", "explore/index.html", "projects/index.html",
                         "about/index.html", "posts/welcome/index.html",
                         "posts/practice/index.html", "projects/toolbox/index.html"):
                html = (output / page).read_text(encoding="utf-8")
                if page == "index.html":
                    self.assertIn("<title>Nightnote</title>", html)
                self.assertIn('/preview/search.json', html)
                assets = re.findall(r'/preview/(?:css|js)/site\.min\.[a-f0-9]+\.(?:css|js)', html)
                self.assertEqual(len(assets), 2)
                for asset in assets:
                    self.assertTrue((output / asset.removeprefix('/preview/')).is_file())
            project = (output / "projects/notebook/index.html").read_text(encoding="utf-8")
            self.assertIn('/preview/posts/welcome/', project)
            self.assertIn('/preview/projects/notebook/cover.svg', project)
            about = (output / "about/index.html").read_text(encoding="utf-8")
            self.assertIn('about-layout', about)
            self.assertNotIn('article-meta', about)
            search = json.loads((output / "search.json").read_text(encoding="utf-8"))
            self.assertTrue(all(item['url'].startswith('/preview/') for item in search))
            self.assertEqual(next(item['type'] for item in search if item['url'] == '/preview/about/'), 'page')

    def test_navigation_and_chinese_taxonomies(self):
        root = Path(__file__).resolve().parents[1]
        with tempfile.TemporaryDirectory() as temporary:
            temporary = Path(temporary)
            content = temporary / "content"
            for section, slug, title, date in [
                ("posts", "older", "Older", "2026-01-01"),
                ("posts", "newer", "Newer", "2026-02-01"),
                ("posts", "plain", "Plain", "2026-03-01"),
                ("projects", "写作工具", "Tool", "2026-01-01"),
            ]:
                path = content / section / slug / "index.md"
                path.parent.mkdir(parents=True, exist_ok=True)
                body = "## 正文\n示例内容。\n"
                if slug == "plain":
                    body = "正文没有小标题。\n"
                if slug == "older":
                    body += "\n`$100` 是代码，不是公式。\n"
                if slug == "newer":
                    body += "\n~~~mermaid\ngraph TD; A-->B\n~~~\n"
                path.write_text(
                    f"---\ntitle: {title}\nslug: {slug}\ndate: {date}\n"
                    "category: 知识管理\n"
                    + ("tags: [TypeScript]\nlinks: [{name: Source, url: https://example.org/source}]\n" if section == "projects" else
                       "tags: [中文标签]\ncollection: 博客建设\n")
                    + ("project: /projects/写作工具/\n" if slug == "newer" else "")
                    + "---\n" + body, encoding="utf-8",
                )
            output = temporary / "public"
            subprocess.run(
                ["hugo", "--config", str(root / "exampleSite/hugo.toml"),
                 "--themesDir", str(root.parent), "--theme", root.name,
                 "--contentDir", str(content), "--destination", str(output)],
                cwd=root, check=True, capture_output=True,
            )
            newer = (output / "posts/newer/index.html").read_text(encoding="utf-8")
            older = (output / "posts/older/index.html").read_text(encoding="utf-8")
            plain = (output / "posts/plain/index.html").read_text(encoding="utf-8")
            self.assertIn("← 较早：Older", newer)
            self.assertIn("较新：Newer →", older)
            self.assertIn("博客建设 ↗</a>", newer)
            self.assertIn("中文标签</a>", newer)
            self.assertIn("知识管理</a>", newer)
            self.assertIn('mermaid@11', newer)
            self.assertNotIn('katex@', older)
            self.assertNotIn('mobile-toc', plain)
            self.assertNotIn('desktop-toc', plain)
            tag = (output / "tags/typescript/index.html").read_text(encoding="utf-8")
            self.assertIn("1 个项目", tag)
            self.assertIn('/projects/%E5%86%99%E4%BD%9C%E5%B7%A5%E5%85%B7/', tag)
            project = (output / "projects/写作工具/index.html").read_text(encoding="utf-8")
            self.assertIn('/posts/newer/', project)
            self.assertIn('href="https://example.org/source"', project)
            topic = next((output / "topics").glob("*/index.html")).read_text(encoding="utf-8")
            self.assertIn("中文标签</a>", topic)


if __name__ == "__main__":
    unittest.main()
