#!/usr/bin/env python3
"""
Basic drift checker between .agent docs and the real DanangTrip Admin repo.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def package_has(package_json: dict, dep_name: str) -> bool:
    deps = package_json.get("dependencies", {})
    dev_deps = package_json.get("devDependencies", {})
    return dep_name in deps or dep_name in dev_deps


def main() -> None:
    parser = argparse.ArgumentParser(description="Verify .agent docs against DanangTrip Admin repo reality")
    parser.add_argument("project", help="Project path")
    args = parser.parse_args()

    project = Path(args.project).resolve()
    agent_root = project / ".agent"
    package_json_path = project / "package.json"

    if not package_json_path.exists():
        print(f"FAIL missing package.json: {package_json_path}")
        sys.exit(1)

    package_json = json.loads(read_text(package_json_path))
    project_rules = read_text(agent_root / "rules" / "PROJECT_RULES.md")
    stack_index = read_text(agent_root / "skills" / "STACK_SKILLS_INDEX.md")

    issues: list[str] = []

    expected_packages = {
        "react-hook-form": "Rules expect react-hook-form but package.json does not declare it.",
        "@hookform/resolvers": "Rules expect @hookform/resolvers but package.json does not declare it.",
        "yup": "Rules expect yup but package.json does not declare it.",
        "react-i18next": "Rules expect react-i18next but package.json does not declare it.",
    }
    for dep_name, message in expected_packages.items():
        if dep_name in project_rules or dep_name in stack_index:
            if not package_has(package_json, dep_name):
                issues.append(message)

    if "test:console" in project_rules and not (project / "tests" / "console-errors.spec.ts").exists():
        issues.append("Rules mention test:console but tests/console-errors.spec.ts is missing.")

    required_paths = [
        project / "src" / "pages",
        project / "src" / "routes" / "index.tsx",
        project / "src" / "api" / "axiosClient.ts",
    ]
    for path in required_paths:
        if not path.exists():
            issues.append(f"Expected path missing: {path}")

    if issues:
        print("FAIL drift detected")
        for issue in issues:
            print(f"- {issue}")
        sys.exit(1)

    print("PASS no obvious .agent drift detected")


if __name__ == "__main__":
    main()
