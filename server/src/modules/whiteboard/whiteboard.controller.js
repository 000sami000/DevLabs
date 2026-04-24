const whiteboardModel = require("./whiteboard.model");

const sanitizeJson = (value) => {
  if (value === undefined) {
    return null;
  }

  return JSON.parse(JSON.stringify(value));
};

const normalizeTldrawDocument = (document) => {
  const sanitizedDocument = sanitizeJson(document);

  if (!sanitizedDocument || typeof sanitizedDocument !== "object") {
    return null;
  }

  if (!sanitizedDocument.store || typeof sanitizedDocument.store !== "object") {
    return sanitizedDocument;
  }

  const normalizedStore = Object.fromEntries(
    Object.entries(sanitizedDocument.store).map(([recordId, record]) => {
      if (!record || typeof record !== "object") {
        return [recordId, record];
      }

      const normalizedRecord = { ...record };

      if (["document", "page", "shape", "asset", "binding"].includes(normalizedRecord.typeName)) {
        if (!normalizedRecord.meta || typeof normalizedRecord.meta !== "object" || Array.isArray(normalizedRecord.meta)) {
          normalizedRecord.meta = {};
        }
      }

      if (normalizedRecord.typeName === "document") {
        if (typeof normalizedRecord.name !== "string") {
          normalizedRecord.name = "";
        }

        if (typeof normalizedRecord.gridSize !== "number") {
          normalizedRecord.gridSize = 10;
        }
      }

      return [recordId, normalizedRecord];
    })
  );

  return {
    ...sanitizedDocument,
    store: normalizedStore,
  };
};

const sanitizeWhiteboardDocument = (document) => {
  if (!document) {
    return null;
  }

  try {
    return normalizeTldrawDocument(document);
  } catch (error) {
    return null;
  }
};

const serializeWhiteboard = (whiteboard) => {
  if (!whiteboard) {
    return null;
  }

  const serializedWhiteboard = whiteboard.toObject ? whiteboard.toObject() : whiteboard;
  return {
    ...serializedWhiteboard,
    document: sanitizeWhiteboardDocument(serializedWhiteboard.document),
  };
};

const getAuthorizedUserId = (req, res) => {
  if (!req.USER_ID) {
    res.status(401).json({ message: "Unauthorized access" });
    return null;
  }

  return req.USER_ID;
};

const sanitizeTitle = (title) => {
  const normalizedTitle = String(title || "").trim();
  return normalizedTitle || "Untitled whiteboard";
};

const listWhiteboards = async (req, res) => {
  const userId = getAuthorizedUserId(req, res);
  if (!userId) return;

  try {
    const whiteboards = await whiteboardModel
      .find({ owner: userId })
      .sort({ updatedAt: -1 })
      .select("_id title createdAt updatedAt");

    return res.status(200).json(whiteboards);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch whiteboards" });
  }
};

const createWhiteboard = async (req, res) => {
  const userId = getAuthorizedUserId(req, res);
  if (!userId) return;

  try {
    const whiteboard = await whiteboardModel.create({
      owner: userId,
      title: sanitizeTitle(req.body?.title),
      document: sanitizeWhiteboardDocument(req.body?.document),
    });

    return res.status(201).json(serializeWhiteboard(whiteboard));
  } catch (error) {
    return res.status(400).json({ message: error.message || "Failed to create whiteboard" });
  }
};

const getWhiteboard = async (req, res) => {
  const userId = getAuthorizedUserId(req, res);
  if (!userId) return;

  try {
    const whiteboard = await whiteboardModel.findOne({
      _id: req.params.w_id,
      owner: userId,
    });

    if (!whiteboard) {
      return res.status(404).json({ message: "Whiteboard not found" });
    }

    return res.status(200).json(serializeWhiteboard(whiteboard));
  } catch (error) {
    return res.status(404).json({ message: error.message || "Failed to fetch whiteboard" });
  }
};

const updateWhiteboard = async (req, res) => {
  const userId = getAuthorizedUserId(req, res);
  if (!userId) return;

  const update = {};

  if (Object.prototype.hasOwnProperty.call(req.body || {}, "title")) {
    update.title = sanitizeTitle(req.body.title);
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, "document")) {
    update.document = sanitizeWhiteboardDocument(req.body.document);
  }

  try {
    const whiteboard = await whiteboardModel.findOneAndUpdate(
      { _id: req.params.w_id, owner: userId },
      update,
      { new: true, runValidators: true }
    );

    if (!whiteboard) {
      return res.status(404).json({ message: "Whiteboard not found" });
    }

    return res.status(200).json(serializeWhiteboard(whiteboard));
  } catch (error) {
    return res.status(400).json({ message: error.message || "Failed to update whiteboard" });
  }
};

const deleteWhiteboard = async (req, res) => {
  const userId = getAuthorizedUserId(req, res);
  if (!userId) return;

  try {
    const whiteboard = await whiteboardModel.findOneAndDelete({
      _id: req.params.w_id,
      owner: userId,
    });

    if (!whiteboard) {
      return res.status(404).json({ message: "Whiteboard not found" });
    }

    return res.status(200).json({ message: "Whiteboard deleted" });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Failed to delete whiteboard" });
  }
};

module.exports = {
  listWhiteboards,
  createWhiteboard,
  getWhiteboard,
  updateWhiteboard,
  deleteWhiteboard,
};
