#!/usr/bin/env python3
"""
Full verification runner for DanangTrip Admin.

This script favors real repo checks over legacy skill-specific scripts.

Usage:
    python .agent/scripts/verify_all.py .
    python .agent/scripts/verify_all.py . --url http://127.0.0.1:5173
"""

import sys
import subprocess
import argparse
from pathlib import Path
from typing import Dict, List
from datetime import datetime


class Colors:
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"


def print_header(text: str) -> None:
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'=' * 70}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text.center(70)}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'=' * 70}{Colors.ENDC}\n")


def print_success(text: str) -> None:
    print(f"{Colors.GREEN}PASS {text}{Colors.ENDC}")


def print_warning(text: str) -> None:
    print(f"{Colors.YELLOW}SKIP {text}{Colors.ENDC}")


def print_error(text: str) -> None:
    print(f"{Colors.RED}FAIL {text}{Colors.ENDC}")


SUITES: List[Dict[str, object]] = [
    {
        "category": "Code Quality",
        "checks": [
            ("Agent Drift Check", ["python", ".agent/scripts/verify_agent_drift.py", "."], True),
            ("Lint", ["npm", "run", "lint"], True),
            ("Typecheck", ["npm", "run", "typecheck"], True),
            ("Build", ["npm", "run", "build"], True),
            ("Prepush Check", ["npm", "run", "prepush:check"], True),
        ],
    },
    {
        "category": "Browser",
        "requires_url": True,
        "checks": [
            ("Playwright Console Check", ["npm", "run", "test:console"], False),
        ],
    },
]


def run_command(name: str, command: List[str], cwd: Path) -> dict:
    started = datetime.now()
    try:
        result = subprocess.run(
            command,
            cwd=str(cwd),
            capture_output=True,
            text=True,
            timeout=1200,
        )
    except subprocess.TimeoutExpired:
        duration = (datetime.now() - started).total_seconds()
        print_error(f"{name} timed out")
        return {"name": name, "passed": False, "skipped": False, "duration": duration, "error": "timeout"}
    except FileNotFoundError as exc:
        duration = (datetime.now() - started).total_seconds()
        print_error(f"{name} command not found")
        return {"name": name, "passed": False, "skipped": False, "duration": duration, "error": str(exc)}

    duration = (datetime.now() - started).total_seconds()
    passed = result.returncode == 0
    if passed:
        print_success(f"{name} ({duration:.1f}s)")
    else:
        print_error(f"{name} ({duration:.1f}s)")
        if result.stderr:
            print(result.stderr[:400])

    return {
        "name": name,
        "passed": passed,
        "skipped": False,
        "duration": duration,
        "stdout": result.stdout,
        "stderr": result.stderr,
    }


def print_report(results: List[dict], started: datetime) -> bool:
    print_header("FULL VERIFICATION REPORT")
    total_duration = (datetime.now() - started).total_seconds()
    passed = sum(1 for item in results if item["passed"] and not item["skipped"])
    failed = sum(1 for item in results if not item["passed"] and not item["skipped"])
    skipped = sum(1 for item in results if item["skipped"])

    print(f"Duration: {total_duration:.1f}s")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Skipped: {skipped}")
    print()

    current_category = None
    for item in results:
        if item.get("category") != current_category:
            current_category = item.get("category")
            print(f"{Colors.BOLD}{current_category}:{Colors.ENDC}")
        status = "PASS"
        if item["skipped"]:
            status = "SKIP"
        elif not item["passed"]:
            status = "FAIL"
        print(f"  {status} {item['name']}")

    return failed == 0


def main() -> None:
    parser = argparse.ArgumentParser(description="Run DanangTrip Admin full verification")
    parser.add_argument("project", help="Project path")
    parser.add_argument("--url", help="Optional browser URL; enables browser checks")
    parser.add_argument("--stop-on-fail", action="store_true", help="Stop on first required failure")
    args = parser.parse_args()

    project_path = Path(args.project).resolve()
    if not project_path.exists():
        print_error(f"Project path does not exist: {project_path}")
        sys.exit(1)

    started = datetime.now()
    print_header("DANANGTRIP ADMIN FULL VERIFICATION")
    print(f"Project: {project_path}")
    print(f"Browser URL: {args.url or 'not provided'}")

    results: List[dict] = []
    for suite in SUITES:
        category = suite["category"]
        if suite.get("requires_url") and not args.url:
            for name, _command, _required in suite["checks"]:
                print_warning(f"{name}: no URL provided")
                results.append({"name": name, "passed": True, "skipped": True, "category": category})
            continue

        print_header(str(category).upper())
        for name, command, required in suite["checks"]:
            result = run_command(name, command, project_path)
            result["category"] = category
            results.append(result)
            if args.stop_on_fail and required and not result["passed"]:
                all_passed = print_report(results, started)
                sys.exit(0 if all_passed else 1)

    all_passed = print_report(results, started)
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
