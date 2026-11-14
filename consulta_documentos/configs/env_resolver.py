"""Resolución de entorno y helpers de nombrado por entorno para CDK.

El entorno lo resuelve `validate_env.py` (que corre antes en la cadena de
cdk.json) y lo escribe en `.cdk-env`. Solo hay dos entornos: `dev` y `prod`.
Este módulo lo lee y ofrece helpers para prefijar nombres de stacks y recursos,
y decidir la política de borrado según el entorno.

Ejemplos de prefijo:
    prod -> prod-Unipaz-Database
    dev  -> dev-Unipaz-Database
"""
from aws_cdk import RemovalPolicy

ENV_FILE = ".cdk-env"


def read_env() -> str:
    """Lee el entorno resuelto por validate_env.py desde `.cdk-env`.

    Raises:
        RuntimeError: si el archivo no existe (validate_env.py no corrió).
    """
    try:
        with open(ENV_FILE, encoding="utf-8") as f:
            env = f.read().strip()
    except FileNotFoundError:
        raise RuntimeError(
            f"'{ENV_FILE}' no encontrado. validate_env.py debe ejecutarse antes "
            "que app.py (revisa la cadena 'app' en cdk.json)."
        )

    if not env:
        raise RuntimeError(f"'{ENV_FILE}' está vacío; no se pudo resolver el entorno.")
    return env


def make_prefix(env: str, separator: str = "-") -> str:
    """Genera el prefijo de entorno (ej. 'prod-')."""
    return f"{env}{separator}"


def prefixed_name(env: str, name: str, separator: str = "-") -> str:
    """Aplica el prefijo de entorno a un nombre de stack o recurso."""
    return f"{env}{separator}{name}"


def is_prod(env: str) -> bool:
    """True si el entorno es producción."""
    return env == "prod"


def removal_config(env: str) -> RemovalPolicy:
    """Política de borrado según entorno: prod RETAIN, resto DESTROY."""
    return RemovalPolicy.RETAIN if is_prod(env) else RemovalPolicy.DESTROY


def ssm_param_name(env: str, component: str, key: str) -> str:
    """Nombre de parámetro SSM con la convención del proyecto.

    /unipaz/<env>/repositorio/<component>/<key>
    """
    return f"/unipaz/{env}/repositorio/{component}/{key}"
