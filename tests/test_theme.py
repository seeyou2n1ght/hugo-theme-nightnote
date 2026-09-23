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
                         "about/index.html", "posts/welcome/index.html"):
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
            search = json.loads((output / "search.json").read_text(encoding="utf-8"))
            self.assertTrue(all(item['url'].startswith('/preview/') for item in search))

    def test_navigation_and_chinese_taxonomies(self):
        root = Path(__file__).resolve().parents[1]
        with tempfile.TemporaryDirectory() as temporary:
            temporary = Path(temporary)
            content = temporary / "content"
            for section, slug, title, date in [
                ("posts", "older", "Older", "2026-01-01"),
                ("posts", "newer", "Newer", "2026-02-01"),
                ("projects", "tool", "Tool", "2026-01-01"),
            ]:
                path = content / section / (slug + ".md")
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(
                    f"---\ntitle: {title}\nslug: {slug}\npublished: {date}\n"
                    "private: false\npublishStatus: published\ncategory: 知识管理\n"
                    + ("tags: [TypeScript]\n" if section == "projects" else
                       "tags: [中文标签]\ncollection: 博客建设\n")
                    + "---\n## 正文\n示例内容。\n", encoding="utf-8",
                )
            output = temporary / "public"
            subprocess.run(
                ["hugo", "--config", str(root / "exampleSite/hugo.yaml"),
                 "--themesDir", str(root.parent), "--theme", root.name,
                 "--contentDir", str(content), "--destination", str(output)],
                cwd=root, check=True, capture_output=True,
            )
            newer = (output / "posts/newer/index.html").read_text(encoding="utf-8")
            older = (output / "posts/older/index.html").read_text(encoding="utf-8")
            self.assertIn("← 较早：Older", newer)
            self.assertIn("较新：Newer →", older)
            self.assertIn("博客建设 ↗</a>", newer)
            self.assertIn("中文标签</a>", newer)
            self.assertIn("知识管理</a>", newer)
            tag = (output / "tags/typescript/index.html").read_text(encoding="utf-8")
            self.assertIn("1 个项目", tag)
            self.assertIn('/projects/tool/', tag)
            topic = next((output / "topics").glob("*/index.html")).read_text(encoding="utf-8")
            self.assertIn("中文标签</a>", topic)


if __name__ == "__main__":
    unittest.main()
