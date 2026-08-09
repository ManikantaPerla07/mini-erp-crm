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

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const followup = await createFollowup({
      ...data,
      createdById: req.user.id,
    });

    return res.status(201).json({
      success: true,
      data: followup,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create follow-up",
    });
  }
}

export async function getAll(_req: Request, res: Response) {
  try {
    const followups = await getAllFollowups();

    return res.status(200).json({
      success: true,
      data: followups,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch follow-ups",
    });
  }
}

export async function getOne(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const followup = await getFollowupById(id);

    if (!followup) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: followup,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch follow-up",
    });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const data = updateFollowupSchema.parse(req.body);

    const existingFollowup = await getFollowupById(id);

    if (!existingFollowup) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    const followup = await updateFollowup(id, data);

    return res.status(200).json({
      success: true,
      data: followup,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update follow-up",
    });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const existingFollowup = await getFollowupById(id);

    if (!existingFollowup) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    await deleteFollowup(id);

    return res.status(200).json({
      success: true,
      message: "Follow-up deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete follow-up",
    });
  }
}