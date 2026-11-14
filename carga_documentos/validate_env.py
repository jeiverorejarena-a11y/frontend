"""Resuelve el entorno CDK antes del deploy. Solo dos entornos: dev o prod.

Se ejecuta ANTES de app.py en la cadena de cdk.json:
    "app": "python validate_env.py && python app.py"

Regla (simple):
  - `--context env=prod`  -> prod
  - rama git `main`       -> prod
  - cualquier otro caso   -> dev  (ramas dev/feature, sin contexto, etc.)

Al resolver, escribe el entorno en `.cdk-env` para que `app.py` lo lea.
Salvaguarda: en la rama `main` no se permite desplegar a un entorno distinto
de prod (evita pisar dev desde main por accidente). Exit 0 = OK, 1 = bloqueo.
"""
import json
import os
import subprocess
import sys

ENV_FILE = ".cdk-env"
VALID_ENVS = {"dev", "prod"}


def get_git_branch() -> str:
    """Obtiene la rama actual de git. Devuelve '' si no se puede determinar."""
    try:
        result = subprocess.run(
            ["git", "branch", "--show-current"],
            capture_output=True,
            text=True,
            check=True,
        )
        return result.stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return ""


def _context_env() -> str:
    """Lee `env` de --context (via CDK_CONTEXT_JSON o argv). '' si no está."""
    ctx_json = os.environ.get("CDK_CONTEXT_JSON")
    if ctx_json:
        try:
            ctx = json.loads(ctx_json)
            if isinstance(ctx, dict) and ctx.get("env"):
                return str(ctx["env"]).lower().strip()
        except json.JSONDecodeError:
            pass

    for i, arg in enumerate(sys.argv):
        if arg == "--context" and i + 1 < len(sys.argv):
            pair = sys.argv[i + 1]
            if pair.startswith("env="):
                return pair.split("=", 1)[1].lower().strip()
        elif arg.startswith("--context") and "env=" in arg:
            return arg.split("env=", 1)[1].lower().strip()
    return ""


def resolve_env(branch: str) -> str:
    """Resuelve a 'dev' o 'prod'.

    prod si el contexto explícito es prod o la rama es main; dev en cualquier
    otro caso.
    """
    ctx_env = _context_env()
    if ctx_env == "prod" or branch == "main":
        return "prod"
    return "dev"


def validate(branch: str, ctx_env: str, resolved: str) -> tuple:
    """Salvaguarda: en 'main' no se permite forzar un entorno != prod."""
    if branch == "main" and ctx_env and ctx_env != "prod":
        return False, (
            f"ERROR: Estás en la rama 'main' pero pediste env='{ctx_env}'.\n"
            "  En 'main' solo se despliega producción (env=prod)."
        )
    if resolved not in VALID_ENVS:
        return False, f"ERROR: entorno inválido '{resolved}'. Solo dev o prod."
    return True, ""


def main() -> None:
    branch = get_git_branch()
    ctx_env = _context_env()
    resolved = resolve_env(branch)

    ok, msg = validate(branch, ctx_env, resolved)
    if not ok:
        print(msg, file=sys.stderr)
        sys.exit(1)

    with open(ENV_FILE, "w", encoding="utf-8") as f:
        f.write(resolved)

    print(f"validate_env OK: rama='{branch or '(desconocida)'}', env='{resolved}'")


if __name__ == "__main__":
    main()
