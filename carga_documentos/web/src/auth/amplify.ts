/**
 * Configuración de Amplify Auth contra el Cognito User Pool (repo outhenticator).
 * Se llama una vez al arrancar la app (main.tsx).
 */
import { Amplify } from "aws-amplify";

import { env } from "@/config/env";

export function configureAmplify(): void {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: env.cognito.userPoolId,
        userPoolClientId: env.cognito.appClientId,
      },
    },
  });
}
