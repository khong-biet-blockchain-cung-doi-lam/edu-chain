#!/usr/bin/env python3
"""
Helper script để chạy các test scenarios
- Tạo test data
- Chạy tests
- Kiểm tra kết quả
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent

def create_test_data():
    """Tạo file Excel test"""
    print("\n📁 Tạo file dữ liệu test...")
    sys.path.insert(0, str(PROJECT_ROOT))
    from tests.test_data_sample import create_test_excel_file
    
    output_file = PROJECT_ROOT / "tests" / "test_students.xlsx"
    df = create_test_excel_file(str(output_file))
    print(f"✓ File test tạo tại: {output_file}")
    return df

def run_tests_locally():
    """Chạy tests locally (không Docker)"""
    print("\n🧪 Chạy tests locally...")
    os.chdir(PROJECT_ROOT)
    
    result = subprocess.run(
        [sys.executable, "-m", "pytest", 
         "tests/test_account_generation.py", 
         "-v", "--tb=short", "-s"],
        capture_output=False
    )
    
    return result.returncode == 0

def run_tests_docker():
    """Chạy tests trong Docker container"""
    print("\n🐳 Chạy tests trong Docker...")
    os.chdir(PROJECT_ROOT)
    
    # Build image
    print("  📦 Building Docker image...")
    build_result = subprocess.run(
        ["docker", "compose", "-f", "../../devops/docker/docker-compose.test.yml", "build"],
        capture_output=True
    )
    
    if build_result.returncode != 0:
        print("❌ Docker build failed:")
        print(build_result.stderr.decode())
        return False
    
    print("  ✓ Image built successfully")
    
    # Run tests
    print("  ▶️  Running tests in container...")
    test_result = subprocess.run(
        ["docker", "compose", "-f", "../../devops/docker/docker-compose.test.yml", "up", "--abort-on-container-exit"],
        capture_output=True
    )
    
    if test_result.returncode == 0:
        print("  ✓ Tests passed!")
    else:
        print("❌ Tests failed:")
        print(test_result.stdout.decode())
        print(test_result.stderr.decode())
    
    # Cleanup
    print("  🧹 Cleaning up containers...")
    subprocess.run(
        ["docker", "compose", "-f", "../../devops/docker/docker-compose.test.yml", "down"],
        capture_output=True
    )
    
    return test_result.returncode == 0

def run_specific_test(test_name):
    """Chạy một test cụ thể"""
    print(f"\n🧪 Chạy test: {test_name}")
    os.chdir(PROJECT_ROOT)
    
    result = subprocess.run(
        [sys.executable, "-m", "pytest", 
         f"tests/test_account_generation.py::{test_name}",
         "-v", "-s"],
        capture_output=False
    )
    
    return result.returncode == 0

def main():
    parser = argparse.ArgumentParser(
        description="Test helper cho Excel account generation"
    )
    parser.add_argument(
        '--mode',
        choices=['local', 'docker', 'data'],
        default='local',
        help='Chế độ chạy test: local hoặc docker'
    )
    parser.add_argument(
        '--test',
        type=str,
        help='Chạy test cụ thể (ví dụ: TestExcelUpload::test_upload_students_success)'
    )
    parser.add_argument(
        '--data-only',
        action='store_true',
        help='Chỉ tạo file test data'
    )
    
    args = parser.parse_args()
    
    print("""
    ╔════════════════════════════════════════════════════╗
    ║  Test Suite: Account & Password Generation        ║
    ║  From Excel Upload                                ║
    ╚════════════════════════════════════════════════════╝
    """)
    
    # Tạo test data
    create_test_data()
    
    if args.data_only:
        print("\n✓ Data created successfully")
        return
    
    # Chạy tests
    if args.test:
        success = run_specific_test(args.test)
    elif args.mode == 'docker':
        success = run_tests_docker()
    else:
        success = run_tests_locally()
    
    if success:
        print("\n✅ All tests passed!")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
