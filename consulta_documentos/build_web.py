"""Construye la SPA consulta_documentos (web/) inyectando las VITE_* desde SSM.

Lee de SSM la URL de la API consulta del entorno resuelto en `.cdk-env`,
escribe `web/.env.production` y ejecuta `npm run build`. El resultado
(web/dist) lo despliega luego el `frontend_stack` con BucketDeployment.

Uso:
    python validate_env.py
    python build_web.py
    cdk deploy
"""
import subprocess
import sys
from pathlib import Path

import boto3

ENV_FILE = Path(".cdk-env")
WEB_DIR = Path("web")
REGION = "us-east-2"


def read_env() -> str:
    if not ENV_FILE.exists():
        print("ERROR: '.cdk-env' no existe. Corre validate_env.py primero.", file=sys.stderr)
        sys.exit(1)
    return ENV_FILE.read_text(encoding="utf-8").strip()


def ssm_get(ssm, name: str) -> str:
    return ssm.get_parameter(Name=name)["Parameter"]["Value"]


def main() -> None:
    env = read_env()
    ssm = boto3.client("ssm", region_name=REGION)
    base = f"/unipaz/{env}/repositorio"

    api_url = ssm_get(ssm, f"{base}/api-consulta/url")

    (WEB_DIR / ".env.production").write_text(f"VITE_API_URL={api_url}\n", encoding="utf-8")
    print(f"[build_web] .env.production escrito para env='{env}'")
    print(f"[build_web] API_URL={api_url}")

    npm = "npm.cmd" if sys.platform == "win32" else "npm"
    if not (WEB_DIR / "node_modules").exists():
        subprocess.run([npm, "ci"], cwd=WEB_DIR, check=True)
    subprocess.run([npm, "run", "build"], cwd=WEB_DIR, check=True)
    print("[build_web] build OK -> web/dist")


if __name__ == "__main__":
    main()
