#!/usr/bin/env python3
"""
Project Checklist Runner for DanangTrip Admin

Runs native project checks in a practical order.

Usage:
    python .agent/scripts/checklist.py .
    python .agent/scripts/checklist.py . --url http://127.0.0.1:5173
"""

import sys
import subprocess
import argparse
from pathlib import Path
from typing import List, Optional


class Colors:
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"


def print_header(text: str) -> None:
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'=' * 60}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text.center(60)}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'=' * 60}{Colors.ENDC}\n")


def print_info(text: str) -> None:
    print(f"{Colors.BOLD}{Colors.CYAN}{text}{Colors.ENDC}")


def print_success(text: str) -> None:
    print(f"{Colors.GREEN}PASS {text}{Colors.ENDC}")


def print_warning(text: str) -> None:
    print(f"{Colors.YELLOW}SKIP {text}{Colors.ENDC}")


def print_error(text: str) -> None:
    print(f"{Colors.RED}FAIL {text}{Colors.ENDC}")


CHECKS = [
    ("Agent Drift Check", ["python", ".agent/scripts/verify_agent_drift.py", "."], True),
    ("Lint", ["npm", "run", "lint"], True),
    ("Typecheck", ["npm", "run", "typecheck"], True),
    ("Build", ["npm", "run", "build"], True),
    ("Prepush Check", ["npm", "run", "prepush:check"], False),
]

BROWSER_CHECKS = [
    ("Playwright Console Check", ["npm", "run", "test:console"], False),
]


def run_command(name: str, command: List[str], cwd: Path) -> dict:
    print_info(f"Running {name}: {' '.join(command)}")
    try:
        result = subprocess.run(
            command,
            cwd=str(cwd),
            capture_output=True,
            text=True,
            timeout=900,
        )
    except subprocess.TimeoutExpired:
        print_error(f"{name}: timeout")
        return {"name": name, "passed": False, "skipped": False, "error": "timeout"}
    except FileNotFoundError as exc:
        print_error(f"{name}: command not found ({exc})")
        return {"name": name, "passed": False, "skipped": False, "error": str(exc)}

    passed = result.returncode == 0
    if passed:
        print_success(name)
    else:
        print_error(name)
        if result.stderr:
            print(result.stderr[:400])

    return {
        "name": name,
        "passed": passed,
        "skipped": False,
        "stdout": result.stdout,
        "stderr": result.stderr,
    }


def print_summary(results: List[dict]) -> bool:
    print_header("CHECKLIST SUMMARY")
    passed = sum(1 for item in results if item["passed"] and not item["skipped"])
    failed = sum(1 for item in results if not item["passed"] and not item["skipped"])
    skipped = sum(1 for item in results if item["skipped"])

    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Skipped: {skipped}")
    print()

    for item in results:
        status = "PASS" if item["passed"] else "FAIL"
        if item["skipped"]:
            status = "SKIP"
        print(f"{status} {item['name']}")

    return failed == 0


def main() -> None:
    parser = argparse.ArgumentParser(description="Run DanangTrip Admin native validation checks")
    parser.add_argument("project", help="Project path")
    parser.add_argument("--url", help="Optional dev URL; enables browser check")
    args = parser.parse_args()

    project_path = Path(args.project).resolve()
    if not project_path.exists():
        print_error(f"Project path does not exist: {project_path}")
        sys.exit(1)

    print_header("DANANGTRIP ADMIN CHECKLIST")
    print(f"Project: {project_path}")
    print(f"Browser URL: {args.url or 'not provided'}")

    results: List[dict] = []

    for name, command, required in CHECKS:
        result = run_command(name, command, project_path)
        results.append(result)
        if required and not result["passed"]:
            print_error(f"Stopping early because required check failed: {name}")
            sys.exit(1)

    if args.url:
        for name, command, _required in BROWSER_CHECKS:
            results.append(run_command(name, command, project_path))
    else:
        for name, _command, _required in BROWSER_CHECKS:
            print_warning(f"{name}: no URL provided")
            results.append({"name": name, "passed": True, "skipped": True})

    all_passed = print_summary(results)
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
