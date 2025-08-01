#!/usr/bin/env python3
"""
Setup script for Eden Printify Product Creator
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="eden-printify",
    version="1.2.0",
    author="Eden Team",
    author_email="team@eden.com",
    description="A powerful Python CLI tool for creating and managing products on Printify with automatic image processing",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/your-org/eden-printify",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    python_requires=">=3.8",
    install_requires=requirements,
    entry_points={
        "console_scripts": [
            "eden-printify=main:cli",
        ],
    },
    keywords="printify, ecommerce, print-on-demand, cli, api",
    project_urls={
        "Bug Reports": "https://github.com/your-org/eden-printify/issues",
        "Source": "https://github.com/your-org/eden-printify",
        "Documentation": "https://github.com/your-org/eden-printify#readme",
    },
) 