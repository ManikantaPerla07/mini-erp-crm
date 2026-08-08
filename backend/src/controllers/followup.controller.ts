import { Request, Response } from "express";
import {
  createFollowup,
  getAllFollowups,
  getFollowupById,
  updateFollowup,
  deleteFollowup,
} from "../services/followup.service";
import {
  createFollowupSchema,
  updateFollowupSchema,
} from "../validations/followup.validation";

export async function create(req: Request, res: Response) {
  try {
    const data = createFollowupSchema.parse(req.body);

    const followup = await createFollowup({
      ...data,
      createdById: req.user!.id,
    });

    return res.status(201).json({
      success: true,
      data: followup,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create follow-up",
    });
  }
}

export async function getAll(req: Request, res: Response) {
  const followups = await getAllFollowups();

  return res.json({
    success: true,
    data: followups,
  });
}

export async function getOne(req: Request, res: Response) {
  const followup = await getFollowupById(req.params.id as string as string);

  if (!followup) {
    return res.status(404).json({
      success: false,
      message: "Follow-up not found",
    });
  }

  return res.json({
    success: true,
    data: followup,
  });
}

export async function update(req: Request, res: Response) {
  try {
    const data = updateFollowupSchema.parse(req.body);

    const followup = await updateFollowup(req.params.id as string as string, data);

    return res.json({
      success: true,
      data: followup,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update follow-up",
    });
  }
}

export async function remove(req: Request, res: Response) {
  await deleteFollowup(req.params.id as string as string);

  return res.json({
    success: true,
    message: "Follow-up deleted successfully",
  });
}