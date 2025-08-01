#!/usr/bin/env python3
"""
Test script to verify Python structure without dependencies
"""

import sys
import os
from pathlib import Path

# Add src to path
sys.path.append(str(Path(__file__).parent / "src"))

def test_imports():
    """Test that all modules can be imported (without dependencies)"""
    print("🔍 Testing Python structure...")
    
    # Test basic imports
    try:
        from utils.config import load_config, validate_config
        print("✅ Config module imported successfully")
    except ImportError as e:
        print(f"⚠️  Config module import failed (expected without dependencies): {e}")
    
    try:
        from utils.image_uploader import ImageUploader
        print("✅ Image uploader module imported successfully")
    except ImportError as e:
        print(f"⚠️  Image uploader module import failed (expected without dependencies): {e}")
    
    try:
        from utils.product_image_processor import ProductImageProcessor
        print("✅ Product image processor module imported successfully")
    except ImportError as e:
        print(f"⚠️  Product image processor module import failed (expected without dependencies): {e}")
    
    try:
        from utils.product_template_generator import ProductTemplateGenerator
        print("✅ Product template generator module imported successfully")
    except ImportError as e:
        print(f"⚠️  Product template generator module import failed (expected without dependencies): {e}")
    
    try:
        from utils.template_generator import TemplateGenerator
        print("✅ Template generator module imported successfully")
    except ImportError as e:
        print(f"⚠️  Template generator module import failed (expected without dependencies): {e}")
    
    try:
        from utils.ai_template_helper import AITemplateHelper
        print("✅ AI template helper module imported successfully")
    except ImportError as e:
        print(f"⚠️  AI template helper module import failed (expected without dependencies): {e}")
    
    try:
        from utils.dynamic_template_helper import DynamicTemplateHelper
        print("✅ Dynamic template helper module imported successfully")
    except ImportError as e:
        print(f"⚠️  Dynamic template helper module import failed (expected without dependencies): {e}")
    
    try:
        from utils.debug_helper import DebugHelper
        print("✅ Debug helper module imported successfully")
    except ImportError as e:
        print(f"⚠️  Debug helper module import failed (expected without dependencies): {e}")

def test_file_structure():
    """Test that all expected files exist"""
    print("\n📁 Testing file structure...")
    
    expected_files = [
        "main.py",
        "requirements.txt",
        "README.md",
        "setup.py",
        "src/__init__.py",
        "src/services/__init__.py",
        "src/utils/__init__.py",
        "src/printify_types/__init__.py",
        "src/services/printify_api.py",
        "src/services/product_service.py",
        "src/utils/config.py",
        "src/utils/debug_helper.py",
        "src/utils/image_uploader.py",
        "src/utils/product_image_processor.py",
        "src/utils/product_template_generator.py",
        "src/utils/template_generator.py",
        "src/utils/ai_template_helper.py",
        "src/utils/dynamic_template_helper.py",
        "src/printify_types/printify.py"
    ]
    
    for file_path in expected_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} - MISSING")

def test_main_structure():
    """Test that main.py has the expected structure"""
    print("\n🔧 Testing main.py structure...")
    
    try:
        with open("main.py", "r") as f:
            content = f.read()
        
        # Check for key components
        checks = [
            ("CLI commands", "cli.command()" in content),
            ("Click import", "import click" in content),
            ("Handler functions", "def handle_" in content),
            ("Main execution", "if __name__ == '__main__':" in content),
            ("Version", "version=\"1.2.0\"" in content)
        ]
        
        for check_name, passed in checks:
            if passed:
                print(f"✅ {check_name}")
            else:
                print(f"❌ {check_name}")
                
    except Exception as e:
        print(f"❌ Failed to read main.py: {e}")

if __name__ == "__main__":
    print("🚀 Testing Eden Printify Python Structure")
    print("=" * 50)
    
    test_file_structure()
    test_imports()
    test_main_structure()
    
    print("\n" + "=" * 50)
    print("✅ Python structure test completed!")
    print("\nTo install dependencies and run the tool:")
    print("1. pip install -r requirements.txt")
    print("2. python main.py --help") 