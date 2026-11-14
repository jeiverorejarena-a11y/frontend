"""Frontend Stack — hosting de la SPA carga_documentos (S3 privado + CloudFront + OAC).

Sirve la SPA React desde un bucket S3 privado a través de CloudFront con Origin
Access Control (sin acceso público directo al bucket). El build de Vite
(web/dist) se genera antes con `build_web.py` y se sube con BucketDeployment,
invalidando la caché.

SPA routing: errores 403/404 de CloudFront redirigen a index.html.
"""
import os

from aws_cdk import (
    CfnOutput,
    Duration,
    Stack,
    Tags,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_s3 as s3,
    aws_s3_deployment as s3deploy,
    aws_ssm as ssm,
)
from constructs import Construct

from configs.env_resolver import is_prod, prefixed_name, removal_config, ssm_param_name

COMPONENT = "web-carga"


class FrontendStack(Stack):
    """S3 privado + CloudFront (OAC) + BucketDeployment del build de Vite."""

    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        env_name: str,
        **kwargs,
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)

        bucket = s3.Bucket(
            self,
            "SiteBucket",
            bucket_name=prefixed_name(env_name, f"unipaz-carga-web-{self.account}").lower(),
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            encryption=s3.BucketEncryption.S3_MANAGED,
            enforce_ssl=True,
            removal_policy=removal_config(env_name),
            auto_delete_objects=not is_prod(env_name),
        )

        distribution = cloudfront.Distribution(
            self,
            "Distribution",
            comment=f"Unipaz Repositorio - carga_documentos ({env_name})",
            default_root_object="index.html",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3BucketOrigin.with_origin_access_control(bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cache_policy=cloudfront.CachePolicy.CACHING_OPTIMIZED,
                response_headers_policy=cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
            ),
            error_responses=[
                cloudfront.ErrorResponse(
                    http_status=403,
                    response_http_status=200,
                    response_page_path="/index.html",
                    ttl=Duration.seconds(0),
                ),
                cloudfront.ErrorResponse(
                    http_status=404,
                    response_http_status=200,
                    response_page_path="/index.html",
                    ttl=Duration.seconds(0),
                ),
            ],
        )

        # El build (web/dist) se genera antes con `build_web.py`. Sin Docker.
        dist_dir = os.path.join(os.path.dirname(__file__), "..", "web", "dist")
        s3deploy.BucketDeployment(
            self,
            "DeployWeb",
            sources=[s3deploy.Source.asset(dist_dir)],
            destination_bucket=bucket,
            distribution=distribution,
            distribution_paths=["/*"],
        )

        distribution_url = f"https://{distribution.distribution_domain_name}"
        ssm.StringParameter(
            self,
            "DistributionUrlParam",
            parameter_name=ssm_param_name(env_name, COMPONENT, "url"),
            string_value=distribution_url,
        )

        Tags.of(self).add("component", COMPONENT)

        CfnOutput(self, "DistributionUrl", value=distribution_url)
        CfnOutput(self, "BucketName", value=bucket.bucket_name)
