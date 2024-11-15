"use client";

import { useChatUI } from "@llamaindex/chat-ui";
import { ChatEvents, SuggestedQuestions } from "@llamaindex/chat-ui/widgets";

import {
  DocumentFileData,
  getAnnotationData,
  ImageData,
  MessageAnnotation,
  MessageAnnotationType,
} from "@llamaindex/chat-ui";
import { ChatFiles, ChatImage } from "@llamaindex/chat-ui/widgets";
import { JSONValue } from "ai";
import { Markdown } from "./markdown";

export function CustomSuggestedQuestions({
  questions,
}: {
  questions: string[];
}) {
  const { append } = useChatUI();
  return <SuggestedQuestions questions={questions} append={append} />;
}

export function CustomChatEvents({ events }: { events: { title: string }[] }) {
  const { isLoading } = useChatUI();
  if (!events.length) return null;
  return <ChatEvents data={events} showLoading={isLoading} />;
}

export function UserMessageDisplay({
  content,
  annotations,
}: {
  content: string;
  annotations?: JSONValue[];
}) {
  const messageAnnotations = annotations as MessageAnnotation[];
  const imageData = getImageData(messageAnnotations);
  const documentFileData = getDocumentFileData(messageAnnotations);

  return (
    <div className="space-y-2">
      <Markdown content={content} />
      {imageData && <ChatImage data={imageData} />}
      {documentFileData && <ChatFiles data={documentFileData} />}
    </div>
  );
}

function getImageData(annotations?: MessageAnnotation[]) {
  return annotations && annotations.length > 0
    ? getAnnotationData<ImageData>(annotations, MessageAnnotationType.IMAGE)[0]
    : undefined;
}

function getDocumentFileData(annotations?: MessageAnnotation[]) {
  return annotations && annotations.length > 0
    ? getAnnotationData<DocumentFileData>(
        annotations,
        MessageAnnotationType.DOCUMENT_FILE,
      )[0]
    : undefined;
}
