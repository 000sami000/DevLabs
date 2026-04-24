import { formatDistanceToNow } from "date-fns";

const stripHtml = (value = "") =>
  String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const sortNotificationsByTime = (notifications = []) =>
  [...notifications].sort((a, b) => {
    const aTime = new Date(a?.createdAt || 0).getTime();
    const bTime = new Date(b?.createdAt || 0).getTime();
    return bTime - aTime;
  });

export const getNotificationActor = (notification = {}) => {
  const id =
    notification.actor_id ||
    notification.commentor_id ||
    notification.creator_id ||
    notification.reporter_id ||
    "";

  const username =
    notification.actor_username ||
    notification.commentor_username ||
    notification.creator_username ||
    notification.reporter_username ||
    "";

  const name =
    notification.actor_name ||
    notification.commentor_name ||
    notification.creator_name ||
    notification.reporter_name ||
    username ||
    "Unknown user";

  const profile_img_ =
    notification.actor_profile_img_ ||
    notification.commentor_profile_img_ ||
    notification.creator_profile_img_ ||
    notification.reporter_profile_img_ ||
    notification.profile_img_ ||
    null;

  return {
    id: id ? String(id) : "",
    name,
    username,
    profile_img_,
  };
};

export const getNotificationActorRoute = (notification = {}) => {
  const actor = getNotificationActor(notification);
  return actor.id ? `/user_overview/${actor.id}` : null;
};

export const formatNotificationMessage = (notification = {}) => {
  const { notifi_type, comment_type, report_type } = notification;
  const actor = getNotificationActor(notification);
  const actorLabel = actor.username || actor.name || "Someone";

  switch (notifi_type) {
    case "comment":
      return `${actorLabel} commented on your ${comment_type || "content"}`;
    case "report_create":
      return `${actorLabel} reported your ${report_type || "content"}`;
    case "problem_create":
      return `${actorLabel} created a new problem`;
    case "solution_create":
      return `${actorLabel} created a new solution`;
    case "article_create":
      return `${actorLabel} created a new article`;
    case "article_update":
      return `${actorLabel} updated an article`;
    default:
      return "You have a new notification";
  }
};

export const formatNotificationDetail = (notification = {}) => {
  if (notification.notifi_type === "comment") {
    return stripHtml(notification.comment_content || "");
  }

  if (notification.notifi_type === "report_create") {
    return stripHtml(notification.report_content || "");
  }

  return stripHtml(notification.content_title || notification.reported_content || "");
};

export const formatNotificationTime = (createdAt) => {
  if (!createdAt) {
    return "Just now";
  }

  const dateValue = new Date(createdAt);

  if (Number.isNaN(dateValue.getTime())) {
    return "Just now";
  }

  return formatDistanceToNow(dateValue, { addSuffix: true });
};
