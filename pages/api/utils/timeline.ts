import prisma from "@/client";

export const getTimeline = async (orderId: number) => {
  let timeline = await prisma.orderTimeline.findFirst({
    where: {
      orderId,
    },
    include: {
      actions: true,
    },
  });

  if (!timeline) {
    timeline = await prisma.orderTimeline.create({
      data: {
        orderId,
      },
      include: {
        actions: true,
      },
    });
  }

  return timeline;
};