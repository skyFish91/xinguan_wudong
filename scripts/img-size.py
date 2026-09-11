#!/usr/bin/env python3
"""
素材清晰度体检工具
====================================================================
背景：`qianduan0/web/public/images/` 里的素材分辨率跨度极大（703px ~ 9500px）。
把低清图放大区域（轮播、详情页主图、登录页左屏）是「页面发虚」的头号来源，
但肉眼在缩略图里看不出来，必须靠脚本体检。

判据（按 2x 屏估算）：
    大区域 ≥ 2048px   轮播 1192px 宽、详情主图 ~680px、登录左屏 ~660px
    卡片   ≥ 800px    缩略图 ≤ 400px 宽，1072px 的图完全够用

用法：
    python scripts/img-size.py qianduan0/web/public/images
    python scripts/img-size.py qianduan0/web/public/images --min 2048

退出码：存在低于 --min 的图时返回 1，可直接串进 CI。
"""

import argparse
import os
import struct
import sys


def _jpeg_size(f):
    """从 JPEG 的 SOF 段读取宽高（不依赖 Pillow）"""
    f.seek(2)
    while True:
        b = f.read(1)
        while b and b != b'\xff':
            b = f.read(1)
        if not b:
            return None
        marker = f.read(1)
        while marker == b'\xff':
            marker = f.read(1)
        if not marker:
            return None
        m = marker[0]
        if m in (0xd8, 0x01) or 0xd0 <= m <= 0xd7:
            continue
        ln = struct.unpack('>H', f.read(2))[0]
        if 0xc0 <= m <= 0xcf and m not in (0xc4, 0xc8, 0xcc):
            f.read(1)
            h, w = struct.unpack('>HH', f.read(4))
            return w, h
        f.seek(ln - 2, 1)


def _png_size(f):
    f.seek(16)
    return struct.unpack('>II', f.read(8))


def image_size(path):
    with open(path, 'rb') as f:
        sig = f.read(8)
        if sig.startswith(b'\xff\xd8'):
            return _jpeg_size(f)
        if sig.startswith(b'\x89PNG'):
            return _png_size(f)
    return None


def tier(long_edge):
    if long_edge >= 2560:
        return '4K+'
    if long_edge >= 2048:
        return '2K'
    if long_edge >= 1600:
        return '1.6K'
    if long_edge >= 800:
        return '可缩略'
    return '过低'


def main():
    ap = argparse.ArgumentParser(description='素材清晰度体检')
    ap.add_argument('dir', help='图片目录')
    ap.add_argument('--min', type=int, default=2048,
                    help='大区域门槛，低于该长边即告警（默认 2048）')
    args = ap.parse_args()

    if not os.path.isdir(args.dir):
        print(f'目录不存在：{args.dir}', file=sys.stderr)
        return 2

    rows, bad, failed = [], [], []
    for n in sorted(os.listdir(args.dir)):
        p = os.path.join(args.dir, n)
        if not os.path.isfile(p):
            continue
        try:
            s = image_size(p)
        except Exception:
            s = None
        if not s:
            failed.append(n)
            continue
        w, h = s
        rows.append((n, w, h, os.path.getsize(p)))
        if max(w, h) < args.min:
            bad.append((n, w, h))

    for n, w, h, sz in rows:
        print(f'{n:28s} {w:5d}x{h:<5d} {tier(max(w, h)):6s} {sz / 1024 / 1024:6.2f}MB')

    print()
    if bad:
        print(f'⚠ 低于 {args.min}px（不可用于大区域，仅限缩略图）：')
        for n, w, h in sorted(bad, key=lambda x: max(x[1], x[2])):
            print(f'    {n:28s} {w}x{h}')
    if failed:
        print('解析失败：' + ', '.join(failed))

    print(f'\n总计 {len(rows)} 张，其中 {len(bad)} 张低于 {args.min}px')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
