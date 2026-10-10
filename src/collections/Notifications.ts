import type { CollectionConfig } from "payload";

export const Notifications: CollectionConfig = {
  slug: "notifications",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "type", "actor", "readAt", "resolvedAt", "createdAt"],
    hidden: true, // Hidden from routine left sidebar; managed through Founder Notification Center
  },
  access: {
    read: ({ req: { user } }) => user?.role === "admin",
    create: ({ req: { user } }) => user?.role === "admin",
    update: ({ req: { user } }) => user?.role === "admin",
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  fields: [
    {
      name: "recipient",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
      admin: {
        description: "Founder administrator who receives this notification",
      },
    },
    {
      name: "type",
      type: "select",
      required: true,
      index: true,
      options: [
        { label: "Editor Registration", value: "editor_registration" },
        { label: "Article Awaiting Approval", value: "article_approval" },
        { label: "Video Awaiting Approval", value: "video_approval" },
        { label: "Topic Awaiting Approval", value: "topic_approval" },
        { label: "Article Resubmission", value: "article_resubmission" },
        { label: "Video Resubmission", value: "video_resubmission" },
      ],
    },
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "message",
      type: "textarea",
      required: true,
    },
    {
      name: "actor",
      type: "relationship",
      relationTo: "users",
      admin: {
        description: "Contributing editor or applicant triggering the event",
      },
    },
    {
      name: "targetCollection",
      type: "select",
      options: [
        { label: "Users (Editor Applications)", value: "users" },
        { label: "Articles", value: "articles" },
        { label: "Videos", value: "videos" },
        { label: "Topics", value: "topics" },
      ],
    },
    {
      name: "targetId",
      type: "text",
      index: true,
    },
    {
      name: "submissionRevision",
      type: "text",
    },
    {
      name: "readAt",
      type: "date",
      index: true,
      admin: {
        description: "Timestamp when founder viewed or marked the notification as read",
      },
    },
    {
      name: "resolvedAt",
      type: "date",
      index: true,
      admin: {
        description: "Timestamp when founder decided on the underlying request (approved/rejected)",
      },
    },
    {
      name: "deduplicationKey",
      type: "text",
      unique: true,
      index: true,
      admin: {
        description: "Unique event idempotency key preventing duplicate notifications",
      },
    },
    {
      name: "link",
      type: "text",
      admin: {
        description: "Dashboard navigation target for the notification action",
      },
    },
  ],
};
