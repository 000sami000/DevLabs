import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiTrash2, FiX } from "react-icons/fi";
import { delete_userNotifications, fetch_userNotifications } from "../../api";
import { useToast } from "../common/ToastProvider";
import AppPagination from "../common/AppPagination";
import Loader from "../Loader";
import getAssetUrl from "../../utils/getAssetUrl";
import {
  formatNotificationDetail,
  formatNotificationMessage,
  formatNotificationTime,
  getNotificationActor,
  getNotificationActorRoute,
  sortNotificationsByTime,
} from "../../utils/notificationHelpers";

function Notifications_main() {
  const navigate = useNavigate();
  const toast = useToast();
  const current_user = useSelector((state) => state.userReducer.current_user);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);

  const pageCount = Math.max(1, Math.ceil((total || 0) / (limit || 10)));

  const loadNotifications = useCallback(async () => {
    if (!current_user?._id) {
      setNotifications([]);
      setTotal(0);
      return;
    }

    try {
      setLoading(true);
      const { data } = await fetch_userNotifications(currentPage, limit);
      const nextNotifications = Array.isArray(data?.notifications) ? sortNotificationsByTime(data.notifications) : [];
      setNotifications(nextNotifications);
      setTotal(Number(data?.total) || 0);
      setLimit(Number(data?.limit) || 10);
    } catch (err) {
      console.log("loadNotifications error", err);
      setNotifications([]);
      setTotal(0);
      toast.error("Load failed", err?.response?.data?.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [current_user?._id, currentPage, limit, toast]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const deleteNotification = async (notificId) => {
    if (!notificId) {
      return;
    }

    try {
      setActionLoading(true);
      const { data } = await delete_userNotifications(notificId, false);
      const nextNotifications = Array.isArray(data?.notifications)
        ? sortNotificationsByTime(data.notifications)
        : [];
      setNotifications(nextNotifications);
      setTotal(Number(data?.total) || nextNotifications.length);
      setLimit(Number(data?.limit) || 10);
      toast.success("Deleted", "Notification removed.");
    } catch (err) {
      console.log("deleteNotification error", err);
      toast.error("Delete failed", err?.response?.data?.message || "Unable to delete notification.");
    } finally {
      setActionLoading(false);
    }
  };

  const clearNotifications = async () => {
    try {
      setActionLoading(true);
      const { data } = await delete_userNotifications(null, true);
      const nextNotifications = Array.isArray(data?.notifications)
        ? sortNotificationsByTime(data.notifications)
        : [];
      setNotifications(nextNotifications);
      setTotal(Number(data?.total) || 0);
      setLimit(Number(data?.limit) || 10);
      setCurrentPage(0);
      toast.success("Cleared", "All notifications removed.");
    } catch (err) {
      console.log("clearNotifications error", err);
      toast.error("Clear failed", err?.response?.data?.message || "Unable to clear notifications.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!current_user) {
    return (
      <div className="theme-page px-4 pb-16 pt-6 md:px-8">
        <div className="mx-auto max-w-4xl">
          <section className="theme-surface theme-panel rounded-[24px] border px-6 py-12 text-center">
            <h1 className="text-2xl font-semibold">Sign in to view notifications</h1>
            <p className="theme-text-muted mt-3 text-sm leading-6">
              Notifications are personalized for each account.
            </p>
            <button
              type="button"
              className="theme-button-primary mt-6 rounded-md px-5 py-2.5 text-sm font-semibold"
              onClick={() => navigate("/auth")}
            >
              Go to login
            </button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page px-4 pb-16 pt-6 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="theme-surface theme-panel rounded-[24px] border px-6 py-7 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="theme-badge inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                Notifications
              </div>
              <h1 className="mt-4 text-3xl font-semibold">Your personalized updates</h1>
              <p className="theme-text-muted mt-2 text-sm leading-6">
                Latest account activity, reports, comments, and content events.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="theme-button-secondary rounded-md px-4 py-2 text-sm font-semibold"
                onClick={loadNotifications}
                disabled={loading || actionLoading}
              >
                Refresh
              </button>

              {total > 0 ? (
                <button
                  type="button"
                  className="theme-button-danger inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold"
                  onClick={clearNotifications}
                  disabled={loading || actionLoading}
                >
                  <FiTrash2 />
                  Clear all
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="theme-surface rounded-[22px] border p-4 md:p-5">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader />
            </div>
          ) : notifications.length > 0 ? (
            <>
              <div className="flex flex-col gap-3">
                {notifications.map((notification) => {
                  const detail = formatNotificationDetail(notification);
                  const actor = getNotificationActor(notification);
                  const actorRoute = getNotificationActorRoute(notification);

                  return (
                    <article
                      key={notification.notific_id || `${notification.notifi_type}-${notification.createdAt}`}
                      className="theme-soft-surface rounded-md border px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          {actorRoute ? (
                            <button
                              type="button"
                              onClick={() => navigate(actorRoute)}
                              className="mb-2 flex items-center gap-2 text-left"
                            >
                              <img
                                src={getAssetUrl(actor.profile_img_)}
                                alt={actor.username || actor.name || "User"}
                                className="h-9 w-9 rounded-full object-cover"
                              />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold leading-5">{actor.name}</p>
                                <p className="theme-text-muted truncate text-xs">@{actor.username || "user"}</p>
                              </div>
                            </button>
                          ) : (
                            <div className="mb-2 flex items-center gap-2">
                              <img
                                src={getAssetUrl(actor.profile_img_)}
                                alt={actor.username || actor.name || "User"}
                                className="h-9 w-9 rounded-full object-cover"
                              />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold leading-5">{actor.name}</p>
                                <p className="theme-text-muted truncate text-xs">@{actor.username || "user"}</p>
                              </div>
                            </div>
                          )}

                          <p className="break-words text-sm font-semibold leading-6">
                            {formatNotificationMessage(notification)}
                          </p>

                          {detail ? (
                            <p className="theme-text-muted mt-1 break-words text-sm leading-6">
                              {detail}
                            </p>
                          ) : null}

                          <p className="theme-text-muted mt-2 text-xs">
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="theme-button-secondary rounded-md p-2"
                          onClick={() => deleteNotification(notification.notific_id)}
                          disabled={actionLoading}
                          aria-label="Delete notification"
                          title="Delete notification"
                        >
                          <FiX />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-5 flex justify-center">
                <AppPagination
                  pageCount={pageCount}
                  currentPage={currentPage}
                  onPageChange={(event) => setCurrentPage(event.selected)}
                />
              </div>
            </>
          ) : (
            <div className="theme-soft-surface rounded-md border px-4 py-10 text-center text-sm">
              No notifications yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Notifications_main;
