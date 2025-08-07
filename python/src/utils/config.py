"""
Configuration utilities for Eden Printify Product Creator
"""

import os
from typing import Dict, Any
from dotenv import load_dotenv


def load_config() -> Dict[str, Any]:
    """
    Load configuration from environment variables and .env file
    """
    # Load .env file if it exists
    load_dotenv()
    
    config = {
        'printify_api_token': os.getenv('PRINTIFY_API_TOKEN'),
        'default_product_json_path': os.getenv('DEFAULT_PRODUCT_JSON_PATH', './product.json')
    }
    
    return config


def validate_config(config: Dict[str, Any]) -> None:
    """
    Validate that required configuration is present
    """
    missing_vars = []
    
    if not config.get('printify_api_token'):
        missing_vars.append('PRINTIFY_API_TOKEN')
    
    if missing_vars:
        raise ValueError(
            f"Missing required environment variables: {', '.join(missing_vars)}\n"
            "Please set these in your .env file or environment variables."
        ) 