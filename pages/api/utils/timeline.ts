import { USER_ROLE } from "@/app/utils/enum";
import prisma from "@/client";
import { getCreatedBy } from "../import-sheets/utils";
import { getTodayDate } from "./date";

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

export const recordAction = async (orderId: number, title: string, createdBy: string, comment: string = '') => {
  const existingTimeline = await getTimeline(orderId);
  const today = getTodayDate();

  await prisma.orderAction.create({
    data: {
      timelineId: existingTimeline.id,
      title,
      comment,
      createdAt: today.dateAndTime,
      createdBy,
      posIndex: existingTimeline.actions.length + 1,
    },
  });
};