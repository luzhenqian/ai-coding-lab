#!/usr/bin/env python3
"""
解析 Excel/CSV 时间表文件，输出结构化 JSON 数据。
支持的列名（不区分大小写）：
  - Date / 日期
  - Description / 描述 / 项目
  - Hours / Quantity / 数量 / 小时
  - Rate / Price / 单价
  - Amount / 金额（可选，自动计算）
"""

import sys
import json
import csv
from pathlib import Path
from decimal import Decimal, ROUND_HALF_EVEN

# 列名映射（统一为英文 key）
COLUMN_MAPPING = {
    # 日期
    "date": "date", "日期": "date",
    # 描述
    "description": "description", "描述": "description",
    "项目": "description", "service": "description", "item": "description",
    # 数量
    "hours": "quantity", "quantity": "quantity",
    "数量": "quantity", "小时": "quantity", "qty": "quantity",
    # 单价
    "rate": "rate", "price": "rate",
    "单价": "rate", "hourly rate": "rate",
    # 金额（可选）
    "amount": "amount", "金额": "amount", "total": "amount",
}


def normalize_column(col: str) -> str:
    """将列名映射为标准字段名。"""
    key = col.strip().lower()
    return COLUMN_MAPPING.get(key, key)


def parse_csv(filepath: str) -> list[dict]:
    """解析 CSV 文件。"""
    rows = []
    with open(filepath, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            normalized = {}
            for col, val in row.items():
                mapped = normalize_column(col)
                normalized[mapped] = val.strip()
            rows.append(normalized)
    return rows


def parse_excel(filepath: str) -> list[dict]:
    """解析 Excel 文件（需要 openpyxl）。"""
    try:
        import openpyxl
    except ImportError:
        print("错误：需要安装 openpyxl。请运行：pip install openpyxl", file=sys.stderr)
        sys.exit(1)

    wb = openpyxl.load_workbook(filepath, read_only=True)
    ws = wb.active
    rows_iter = ws.iter_rows(values_only=True)

    # 第一行作为表头
    headers = [normalize_column(str(h)) if h else f"col_{i}" for i, h in enumerate(next(rows_iter))]

    rows = []
    for row in rows_iter:
        if all(cell is None for cell in row):
            continue
        entry = {}
        for header, cell in zip(headers, row):
            entry[header] = str(cell).strip() if cell is not None else ""
        rows.append(entry)

    wb.close()
    return rows


def process_rows(rows: list[dict]) -> dict:
    """处理行数据，计算金额，输出结构化结果。"""
    line_items = []
    errors = []

    for i, row in enumerate(rows, 1):
        description = row.get("description", "")
        if not description:
            errors.append(f"第 {i} 行：缺少描述")
            continue

        try:
            quantity = Decimal(row.get("quantity", "0"))
        except Exception:
            errors.append(f"第 {i} 行：数量格式错误 '{row.get('quantity')}'")
            continue

        try:
            rate = Decimal(row.get("rate", "0"))
        except Exception:
            errors.append(f"第 {i} 行：单价格式错误 '{row.get('rate')}'")
            continue

        amount = (quantity * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_EVEN)

        item = {
            "description": description,
            "quantity": str(quantity),
            "rate": str(rate),
            "amount": str(amount),
        }

        if row.get("date"):
            item["date"] = row["date"]

        line_items.append(item)

    subtotal = sum(Decimal(item["amount"]) for item in line_items)

    result = {
        "line_items": line_items,
        "subtotal": str(subtotal.quantize(Decimal("0.01"), rounding=ROUND_HALF_EVEN)),
        "item_count": len(line_items),
    }

    if errors:
        result["errors"] = errors

    return result


def main():
    if len(sys.argv) < 2:
        print("用法：python parse_timesheet.py <文件路径>", file=sys.stderr)
        sys.exit(1)

    filepath = sys.argv[1]
    path = Path(filepath)

    if not path.exists():
        print(f"错误：文件不存在 '{filepath}'", file=sys.stderr)
        sys.exit(1)

    suffix = path.suffix.lower()
    if suffix == ".csv":
        rows = parse_csv(filepath)
    elif suffix in (".xlsx", ".xls"):
        rows = parse_excel(filepath)
    else:
        print(f"错误：不支持的文件格式 '{suffix}'，请使用 .csv 或 .xlsx", file=sys.stderr)
        sys.exit(1)

    result = process_rows(rows)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
