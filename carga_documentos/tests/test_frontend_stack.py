"""Tests del FrontendStack de carga_documentos (CDK assertions).

Requiere que exista web/dist (correr `python build_web.py` o `npm run build`).
Ejecutar desde la raíz del repo:
    python -m unittest discover -s tests -v
"""
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import aws_cdk as cdk  # noqa: E402
from aws_cdk.assertions import Match, Template  # noqa: E402

from stacks.frontend_stack import FrontendStack  # noqa: E402

ENV = cdk.Environment(account="041391475423", region="us-east-2")


@unittest.skipUnless((ROOT / "web" / "dist" / "index.html").exists(), "falta web/dist")
class FrontendStackTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = cdk.App()
        stack = FrontendStack(cls.app, "TestCargaWeb", env_name="prod", env=ENV)
        cls.t = Template.from_stack(stack)

    def test_bucket_is_private_and_encrypted(self):
        self.t.has_resource_properties(
            "AWS::S3::Bucket",
            {
                "BucketName": "prod-unipaz-carga-web-041391475423",
                "PublicAccessBlockConfiguration": {
                    "BlockPublicAcls": True,
                    "BlockPublicPolicy": True,
                    "IgnorePublicAcls": True,
                    "RestrictPublicBuckets": True,
                },
                "BucketEncryption": Match.any_value(),
            },
        )

    def test_cloudfront_https_with_oac_and_spa_fallback(self):
        self.t.resource_count_is("AWS::CloudFront::OriginAccessControl", 1)
        self.t.has_resource_properties(
            "AWS::CloudFront::Distribution",
            {
                "DistributionConfig": Match.object_like(
                    {
                        "DefaultRootObject": "index.html",
                        "DefaultCacheBehavior": Match.object_like(
                            {"ViewerProtocolPolicy": "redirect-to-https"}
                        ),
                        "CustomErrorResponses": Match.array_with(
                            [Match.object_like({"ErrorCode": 404, "ResponseCode": 200,
                                                "ResponsePagePath": "/index.html"})]
                        ),
                    }
                )
            },
        )

    def test_publishes_url(self):
        self.t.has_resource_properties(
            "AWS::SSM::Parameter", {"Name": "/unipaz/prod/repositorio/web-carga/url"}
        )

    def test_no_context_lookups(self):
        manifest = json.loads(
            (Path(self.app.synth().directory) / "manifest.json").read_text(encoding="utf-8")
        )
        self.assertEqual([m["key"] for m in manifest.get("missing", [])], [])


if __name__ == "__main__":
    unittest.main()
