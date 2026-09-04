import { AuthRepository } from "@/server/auth/repositories/AuthRepository";
import { AppError } from "@/server/lib/errors";

// neslead se monta por la agencia: nadie se registra sin invitación previa.
// La bandera existe para encender el autoservicio más adelante sin tocar código.
//
// Arranque en frío: con la bandera encendida por defecto, en un despliegue
// nuevo tampoco puede registrarse el primer usuario (no hay quien lo invite
// todavía). Ese despliegue inicial necesita arrancar con
// INVITE_ONLY_SIGNUP=false o sembrar el primer usuario por otra vía.
export async function assertSignupAllowed(email: string, inviteOnly: boolean) {
  if (!inviteOnly) return;
  const invited = await AuthRepository.hasPendingInvitationForEmail(email);
  if (!invited) {
    throw new AppError(
      "FORBIDDEN",
      "El registro es solo por invitación. Pide acceso a tu agencia.",
    );
  }
}
