import { relay as rawRelay, sendViaRelay as rawSendViaRelay } from "./relay"
import type { MessageName, PlasmoMessaging } from "./types"
import { getActiveTab, getExtRuntime, getExtTabs } from "./utils"

export type {
  PlasmoMessaging,
  MessageName,
  PortName,
  PortsMetadata,
  MessagesMetadata,
  OriginContext
} from "./types"

/**
 * Send to Background Service Workers from Content Scripts or Extension pages.
 * `extensionId` is required to send a message from a Content Script in the main world
 */
// TODO: Add a framework runtime check, using a global variable
export const sendToBackground: PlasmoMessaging.SendFx<MessageName> = async (
  req
) => {
  return getExtRuntime().sendMessage(req.extensionId ?? null, req)
}

/**
 * Send to Content Scripts from Extension pages or Background Service Workers.
 * Default to active tab if no tabId is provided in the request
 */
export const sendToContentScript: PlasmoMessaging.SendFx = async (req) => {
  const tabId =
    typeof req.tabId === "number" ? req.tabId : (await getActiveTab())?.id

  if (!tabId) {
    throw new Error("No active tab found to send message to.")
  }

  return getExtTabs().sendMessage(tabId, req)
}

/**
 * @deprecated Renamed to `sendToContentScript`
 */

export const sendToActiveContentScript = sendToContentScript

/**
 * Any request sent to this relay get send to background, then emitted back as a response
 */
export const relayMessage: PlasmoMessaging.MessageRelayFx = (req) =>
  rawRelay(req, sendToBackground)

/**
 * @deprecated Migrated to `relayMessage`
 */
export const relay = relayMessage

export const sendToBackgroundViaRelay: PlasmoMessaging.SendFx<MessageName> =
  rawSendViaRelay

/**
 * @deprecated Migrated to `sendToBackgroundViaRelay`
 */
export const sendViaRelay = sendToBackgroundViaRelay
