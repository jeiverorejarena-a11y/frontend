"""Configuration loader.

Al cargar cualquier YAML se resuelve el placeholder ``{{env}}`` con el entorno
activo (dev / prod), leído de ``.cdk-env`` vía env_resolver.
"""
from pathlib import Path
from typing import Any, Dict

import yaml

from configs.env_resolver import read_env

_ENV_PLACEHOLDER = "{{env}}"


def _resolve_placeholders(node: Any, env: str) -> Any:
    """Reemplaza ``{{env}}`` por el entorno en cualquier string del árbol."""
    if isinstance(node, dict):
        return {k: _resolve_placeholders(v, env) for k, v in node.items()}
    if isinstance(node, list):
        return [_resolve_placeholders(v, env) for v in node]
    if isinstance(node, str) and _ENV_PLACEHOLDER in node:
        return node.replace(_ENV_PLACEHOLDER, env)
    return node


def load_config(config_file: str) -> Dict[str, Any]:
    """Carga un YAML de configs/ con ``{{env}}`` ya resuelto."""
    config_path = Path(__file__).parent / config_file
    with open(config_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return _resolve_placeholders(data, read_env())
