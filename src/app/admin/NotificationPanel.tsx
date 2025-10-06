"use client";

import { useAppStore } from "@/store/appStore";
import { X, Check } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";

dayjs.extend(relativeTime);
dayjs.locale("pt-br");

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({
  isOpen,
  onClose,
}: NotificationPanelProps) {
  const { notifications, clients, markNotificationAsRead } = useAppStore();
  const unreadNotifications = notifications
    .filter((n) => !n.read)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const getUrgencyColor = (urgency: "low" | "medium" | "high") => {
    if (urgency === "high") return "border-red-500";
    if (urgency === "medium") return "border-orange-500";
    return "border-yellow-500";
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-14 right-0 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
      <div className="flex justify-between items-center p-3 border-b border-gray-700">
        <h3 className="font-semibold">Notificações</h3>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {unreadNotifications.length > 0 ? (
          unreadNotifications.map((notif) => {
            const client = clients.find((c) => c.client_id === notif.clientId);
            const borderClass =
              notif.type === "approval_reminder"
                ? getUrgencyColor(notif.urgency)
                : "border-blue-500";

            return (
              <div
                key={notif.id}
                className={`p-3 border-l-4 ${borderClass} hover:bg-gray-800`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={
                      client?.profile_picture_url ||
                      `https://ui-avatars.com/api/?name=${client?.name.substring(
                        0,
                        2
                      )}`
                    }
                    className="w-8 h-8 rounded-full mt-1"
                    alt={client?.name}
                  />
                  <div className="flex-1">
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs text-gray-500">
                      {dayjs(notif.createdAt).fromNow()}
                    </p>
                  </div>
                  <button
                    onClick={() => markNotificationAsRead(notif.id)}
                    className="p-1 text-gray-500 hover:text-green-400"
                    title="Marcar como lida"
                  >
                    <Check size={16} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="p-4 text-center text-sm text-gray-500">
            Nenhuma nova notificação.
          </p>
        )}
      </div>
    </div>
  );
}
