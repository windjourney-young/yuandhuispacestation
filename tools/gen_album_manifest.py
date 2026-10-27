#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
相册清单生成脚本
================

作用：
    扫描项目根目录下的 `images/` 文件夹，把里面的所有图片文件
    自动写入 `js/album-manifest.js` 清单。网页加载该清单后即可
    在「🌏 地球 · 星际相册」弹窗里展示这些图片。

使用方法：
    1. 把你的图片（建议横图，900x600 左右）放进 images/ 文件夹
       （支持 .jpg .jpeg .png .webp .gif .bmp）
    2. 双击运行本脚本，或命令行执行：
         python tools/gen_album_manifest.py
    3. 把生成的 js/album-manifest.js 和 images/ 文件夹一起提交到 GitHub
    4. 网页刷新即可看到新相册

删除图片：直接从 images/ 删除对应文件，再次运行本脚本即可同步。

注意：本脚本不会上传任何东西到 GitHub，只是更新本地清单文件。
      提交到 GitHub 的操作请参考项目根目录的「日常更新同步指南.html」。
"""

import os
import sys

# 支持的图片扩展名
IMG_EXTS = ('.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp')

# 定位项目根目录（本脚本在 tools/ 下，根目录是上一级）
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

IMAGES_DIR = os.path.join(PROJECT_ROOT, 'images')
OUTPUT_FILE = os.path.join(PROJECT_ROOT, 'js', 'album-manifest.js')


def collect_images():
    """扫描 images/ 目录，返回相对路径列表（按文件名排序，统一用正斜杠）。"""
    if not os.path.isdir(IMAGES_DIR):
        return []
    items = []
    for name in os.listdir(IMAGES_DIR):
        # 跳过隐藏文件、说明文件、子目录
        if name.startswith('.'):
            continue
        if name.lower().endswith('.txt') or name.lower().endswith('.md'):
            continue
        if os.path.splitext(name)[1].lower() not in IMG_EXTS:
            continue
        items.append(name)
    items.sort()
    # 用 'images/xxx' 这种相对路径，便于网页直接引用
    return ['images/' + n for n in items]


def write_manifest(images):
    """把图片列表写入 js/album-manifest.js。"""
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    lines = []
    lines.append('/* ============================================================')
    lines.append('   相册图片清单（由 tools/gen_album_manifest.py 自动生成）')
    lines.append('   请勿手动编辑此文件 —— 增减图片后重新运行脚本即可')
    lines.append('   ============================================================ */')
    lines.append('')
    lines.append('// 相册图片地址列表，网页加载后写入 window.ALBUM_IMAGES')
    lines.append('window.ALBUM_IMAGES = [')
    for path in images:
        # 用单引号包裹路径，避免转义
        lines.append("  '" + path + "',")
    lines.append('];')
    lines.append('')
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))


def main():
    images = collect_images()
    write_manifest(images)

    print('=' * 56)
    print(' 相册清单生成完成')
    print('=' * 56)
    print(' 扫描目录  :', IMAGES_DIR)
    print(' 输出文件  :', OUTPUT_FILE)
    print(' 图片数量  :', len(images))
    print('-' * 56)
    if images:
        print(' 包含图片  :')
        for p in images:
            print('   -', p)
    else:
        print(' ⚠ images/ 文件夹为空，相册将回退到示例占位图。')
        print('   请把你的图片放进 images/ 后重新运行本脚本。')
    print('-' * 56)
    print(' 下一步：把 images/ 和 js/album-manifest.js 一起提交到 GitHub。')
    print('=' * 56)

    # Windows 双击运行时，让窗口停留以便看到输出
    if sys.platform.startswith('win'):
        try:
            input('\n按回车键关闭窗口...')
        except EOFError:
            pass


if __name__ == '__main__':
    main()
