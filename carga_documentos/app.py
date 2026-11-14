"""CDK App — Frontend carga_documentos (Repositorio Digital UNIPAZ).

Despliega la SPA React (build de Vite en web/dist) en S3 privado + CloudFront
(OAC). El build se genera antes con `build_web.py` (inyecta las VITE_* desde SSM:
URL de la API carga y los IDs de Cognito).

Cadena en cdk.json: `python validate_env.py && python app.py`.
"""
import aws_cdk as cdk

from configs.config import load_config
from configs.env_resolver import prefixed_name, read_env
from stacks.frontend_stack import FrontendStack


app = cdk.App()

env_name = read_env()
app_config = load_config("app_config.yaml")
app_settings = app_config["app_settings"]

env = cdk.Environment(
    account=app_settings["account_id"],
    region=app_settings["region"],
)

cdk.Tags.of(app).add("project", "Unipaz")
cdk.Tags.of(app).add("environment", env_name)
for key, value in app_settings.get("tags", {}).items():
    cdk.Tags.of(app).add(key, value)

FrontendStack(
    app,
    prefixed_name(env_name, "Unipaz-Carga-Frontend"),
    env_name=env_name,
    env=env,
    description="S3 + CloudFront hosting carga_documentos - Repositorio UNIPAZ",
)

app.synth()
