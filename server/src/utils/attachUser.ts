import prisma from "./db.ts";

export const attachUser = async (decoded: { userId: string; companyId: string }) => {

  const user = await prisma.user.findFirst({
    where: { id: decoded.userId, companyId: decoded.companyId },
    include: {
      branch: {
        select: { name: true },
      },
    },
  });

  if (!user) return null;

  const { password, ...safeUser } = user;

  return safeUser;
}
