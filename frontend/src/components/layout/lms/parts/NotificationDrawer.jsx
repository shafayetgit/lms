"use client";

import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import { 
  Close as CloseIcon,
  NotificationsNoneOutlined
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  useReadNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "@/features/notification/notificationApi";

dayjs.extend(relativeTime);

export default function NotificationDrawer({ open, onClose }) {
  const theme = useTheme();
  const router = useRouter();

  const { data: notificationsData } = useReadNotificationsQuery({ page: 1, size: 50 });
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

  const notifications = notificationsData?.data || [];

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await markAsRead(notif.public_id);
    }
    if (notif.link) {
      router.push(notif.link);
    }
    onClose();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      transitionDuration={{ enter: 300, exit: 250 }}
      disableScrollLock
      ModalProps={{
        keepMounted: true,
      }}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 400 },
            bgcolor: "background.paper",
            backgroundImage: "none",
            borderLeft: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            color: "text.primary",
            boxShadow: theme.shadows[8],
            borderRadius: 0,
          },
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            px: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: { xs: 56, md: 64 },
            height: { xs: 56, md: 64 },
            boxSizing: "border-box",
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          }}
        >
          <Typography
            variant="h6"
            fontWeight="600"
            sx={{ letterSpacing: "-0.01em" }}
          >
            Notifications
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <List sx={{ p: 0, flexGrow: 1, overflowY: "auto" }}>
          {notifications.length === 0 ? (
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: (theme) => alpha(theme.palette.text.secondary, 0.05),
                  mb: 2,
                }}
              >
                <NotificationsNoneOutlined sx={{ fontSize: 32, color: "text.secondary", opacity: 0.7 }} />
              </Box>
              <Typography variant="body1" sx={{ color: "text.primary", fontWeight: 600, mb: 0.5 }}>
                No notifications yet
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center" }}>
                When you get notifications, they&apos;ll show up here
              </Typography>
            </Box>
          ) : (
            notifications.map((notif, index) => {
              return (
                <Box key={notif.public_id}>
                  <ListItem
                    disablePadding
                    onClick={() => handleNotificationClick(notif)}
                    sx={{
                      cursor: "pointer",
                      bgcolor: notif.read
                        ? "transparent"
                        : alpha(theme.palette.primary.main, 0.02),
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <Box sx={{ py: 1.5, px: 3, width: "100%" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2" fontWeight="600" color="text.primary">
                          {notif.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", fontWeight: 500 }}
                        >
                          {dayjs(notif.created_at).fromNow()}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          lineHeight: 1.5,
                        }}
                      >
                        {notif.message}
                      </Typography>
                    </Box>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              );
            })
          )}
        </List>

        <Box
          sx={{
            p: 2.5,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            bgcolor: alpha(theme.palette.background.default, 0.5),
          }}
        >
          <Typography
            variant="button"
            onClick={handleMarkAllRead}
            sx={{
              display: "block",
              textAlign: "center",
              color: "primary.main",
              fontWeight: 600,
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Mark All as Read
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
