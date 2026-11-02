"use client";

import { useCallback } from "react";
import { App, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { getErrorInfo } from "@/lib/request";

/**
 * Muestra errores como un message persistente (no se cierra solo), con ancho/alto
 * acotados y un botón para quitarlo manualmente.
 */
export function useErrorMessage() {
  const { message } = App.useApp();

  return useCallback(
    (error: unknown) => {
      const { title, detail } = getErrorInfo(error);
      const text = detail ? `${title}: ${detail}` : title;
      const key = `error-${Date.now()}-${Math.random()}`;

      message.open({
        key,
        type: "error",
        duration: 0,
        content: (
          <span style={{ display: "inline-flex", alignItems: "flex-start", gap: 12 }}>
            <span
              title={text}
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 3,
                overflow: "hidden",
                maxWidth: "min(480px, 70vw)",
                textAlign: "left",
                overflowWrap: "anywhere",
              }}
            >
              {text}
            </span>
            <Button
              type="text"
              size="small"
              aria-label="Cerrar"
              icon={<CloseOutlined style={{ fontSize: 12 }} />}
              onClick={() => message.destroy(key)}
              style={{ flexShrink: 0, width: 22, height: 22, minWidth: 22 }}
            />
          </span>
        ),
      });
    },
    [message],
  );
}
