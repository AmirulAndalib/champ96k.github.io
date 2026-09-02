---
title: "Beyond the Main Frame: Architecture and Implementation of Secure iFrame-to-Native Communication in WebView Mini Apps"
description: >-
  Cross-origin iframes in WebView mini apps cannot touch the native bridge.
  Same-origin policy blocks them. Most teams relay through the main frame.
  We routed directly to native instead, so security validation could not be
  tampered with.
date: 2026-09-03
type: Technical
tags:
  - Android
  - iOS
  - WebView
  - Security
  - Mini apps
draft: false
---

*Originally published on the [Gojek engineering blog](https://medium.com/gojekengineering/beyond-the-main-frame-architecture-and-implementation-of-secure-iframe-to-native-communication-in-e77b30445c04).*

Cross-origin iframes in WebView mini apps can't touch the native bridge. Same-origin policy blocks them. Most teams work around this with a relay through the main frame. We didn't. Routing directly to native instead of through JavaScript meant security validation couldn't be tampered with, and iframes stopped depending on a main frame that might navigate away or crash.

<figure>
  <img src="/writing/iframe-native-bridge/overview.png" alt="Secure native API access for cross-origin iframes: mini-app WebView iframes blocked from the native bridge by same-origin policy, then routed through origin validation, a permission engine, and a handler layer using postMessage.">
  <figcaption>Direct access from partner iframes is blocked. Validated calls go through the native bridge and return via postMessage.</figcaption>
</figure>

Every GoTo mini app runs inside a WebView. Some of those mini apps embed third-party iframes — a payment checkout here, a partner widget there. And when those iframes need to call a native API, the browser quietly blocks them. For a long time, we lived with a workaround. Then the workaround became the problem.

## The problem

When a native application injects a JavaScript bridge object into a WebView, that object lives in the main frame's `window`. Every iframe has its own isolated execution context, and cross-origin iframes cannot reach across into the main frame's properties. A mini app embedding a payment checkout from a partner domain cannot simply call `parent.NativeBridge.call()` — the browser blocks it immediately.

Three factors combine to create this constraint:

1. Each iframe maintains its own JavaScript execution context with an independent `window` object.
2. Native bridge injection targets only the main frame — `WKUserScript` on iOS and `@JavascriptInterface` on Android.
3. Same-origin policy prevents cross-origin frames from accessing each other's properties altogether.

<figure>
  <img src="/writing/iframe-native-bridge/the-problem.png" alt="Host application containing a WebView. The main frame at miniapp.example.com has window.NativeBridge available. A partner iframe at partner.example.com does not, and window.parent is blocked by same-origin policy.">
  <figcaption>The native bridge is injected into the main frame only. Cross-origin iframes cannot reach it through window.parent.</figcaption>
</figure>

## Two approaches considered

We evaluated two architectural paths before settling on our final design.

### Main frame relay

The first approach routes everything through the main frame. The iframe sends requests via `postMessage`, the main frame invokes the native bridge, and the response is relayed back. It is straightforward to implement and requires no changes to the native layer.

The problem is coupling. If the main frame navigates away or crashes, iframe bridge access is lost. With multiple iframes, the main frame becomes a bottleneck. Worse, security validation lives in JavaScript — code that can be tampered with — rather than in native code where it cannot.

### Isolated iframe bridge (chosen approach)

The second approach establishes direct communication between the native layer and each iframe. The SDK in the iframe sends requests through the standard bridge channel; native sends responses back via `postMessage`. Security validation happens in native code. Each iframe gets its own permission set. Partners do not need to implement any custom relay logic.

<figure>
  <img src="/writing/iframe-native-bridge/two-approaches.png" alt="Sequence diagrams comparing a main-frame relay, where the iframe talks to native through the main frame, with an isolated bridge, where the iframe calls the native bridge directly and receives a postMessage response.">
  <figcaption>Left: the relay approach introduces a bottleneck and JavaScript-layer security checks. Right: the isolated bridge validates in native code and responds directly.</figcaption>
</figure>

## Architecture

The system has three distinct layers inside the native bridge, followed by a postMessage dispatch mechanism and per-frame SDK instances.

<figure>
  <img src="/writing/iframe-native-bridge/bridge-layers.png" alt="Native bridge layers: entry point, origin validation, handler permission check, and origin snapshot, then a postMessage dispatch layer routing to the main frame, a payment iframe, or a rejected unknown iframe.">
  <figcaption>All calls flow through three validation layers before the response is routed back to the originating frame via postMessage.</figcaption>
</figure>

## End-to-end call flow

A complete bridge call from an iframe happens in two phases: configuration at launch, and the call itself at runtime.

During configuration, the host app fetches mini app metadata from the backend. This includes the main frame permission list and an array of iframe entries, each specifying an origin, its own permission set, and navigation whitelists. These are transformed into a WebKit configuration and passed to the SDK before any content loads. The bridge does not accept runtime configuration changes.

<figure>
  <img src="/writing/iframe-native-bridge/call-flow.png" alt="Sequence from iframe SDK to native bridge to handler to dispatch script: origin validation, permission check, origin snapshot, handler execution, then evaluateJavaScript in the main frame and contentWindow.postMessage to the matching iframe.">
  <figcaption>The call originates in the iframe SDK, passes three native validation stages, and returns via a dispatch script that routes to the correct frame using hostname matching.</figcaption>
</figure>

## Security model

The three layers each address a distinct threat vector rather than providing redundant checks of the same thing.

<figure>
  <img src="/writing/iframe-native-bridge/security-model.png" alt="Security model table: origin validation against unknown iframes, permission scoping for least privilege per frame, and an origin snapshot to prevent replay on navigation.">
  <figcaption>Each layer answers a different question. Together they enforce a complete chain of trust from origin through to handler execution.</figcaption>
</figure>

The configuration lives on the backend and is fetched at launch time, not embedded in client code. The bridge does not accept runtime configuration changes. The permission and whitelist setup is fixed for the lifetime of the session.

| Layer | Threat addressed | Mechanism |
| --- | --- | --- |
| Origin validation | Is this iframe known? Unknown iframes get no bridge access | Per-mini-app backend whitelist |
| Permission scoping | Can this iframe call this handler? Least privilege per frame | Separate permission sets per origin |
| Origin snapshot | Did this navigation come from an authorized frame? Prevents replay on navigation | FIFO queue, one-time consumption |

## Platform differences

The architectural pattern is identical across Android and iOS. Implementation details differ because the platforms expose different APIs for frame context.

**Android** uses `WebViewCompat.addWebMessageListener()` from the AndroidX WebKit library, which provides `sourceOrigin` and `isMainFrame` in the callback. The legacy `@JavascriptInterface` is retained for backward compatibility but does not carry origin information, so the JS SDK uses two separate call paths depending on whether postMessage mode is active.

**iOS** uses `WKScriptMessage`, which inherently provides `WKFrameInfo` with the request URL. No API migration was needed on iOS. The same bridge path handles both main frame and iframe calls, and the frame info is available directly in the delegate method.

## Engineering challenges

### Thread-safe frame context correlation

Bridge calls span multiple threads. Incoming messages arrive on the WebView's callback thread, consent checks may involve background threads, and handler execution happens on the main thread. We use a FIFO queue with atomic operations: a snapshot is stored at bridge entry and consumed exactly once when the handler executes. This guarantees sequential calls are correctly paired with their frame contexts.

### Response routing to cross-origin iframes

Native can only run JavaScript via `evaluateJavaScript` in the main frame context. We inject a small dispatch script that runs in the main frame, iterates direct child iframes, matches the target hostname against each iframe's `src` attribute, and calls `contentWindow.postMessage()` on the matching frame. We traverse only depth-1 iframes, as nested iframes inherit their parent's configuration.

### Concurrent access to event-based handlers

Some handlers — compass, accelerometer, gyroscope — continuously stream data and cannot support concurrent consumers. We enforce a single-session policy: when a handler already has an active session, subsequent registration attempts receive an error. The SDK propagates this to the caller. This keeps resource management simple and predictable.

### Backward compatibility

Existing mini apps use a direct callback mechanism where native calls a global `window.gpCoreCallback` function. Changing this to postMessage would break all existing implementations. The bridge SDK maintains both paths simultaneously. Legacy callbacks continue to work for main frame calls; the postMessage path handles iframe calls. A configuration flag enables postMessage mode automatically when iframe definitions are present. Mini apps without iframes see no behavior change at all.

## Decision summary

| Decision | Rationale | Alternative rejected |
| --- | --- | --- |
| Direct iframe bridge | No coupling between frames; security validation in native code where it cannot be bypassed | Main frame relay — coupled, unscalable, security logic lives in JS |
| PostMessage for response delivery | Only viable mechanism for cross-origin frame communication | `evaluateJavaScript` — cannot target cross-origin frames |
| FIFO queue for origin tracking | Guarantees sequential ordering; one-time consumption prevents replay | Call ID mapping — adds protocol complexity with no additional security benefit |
| Depth-1 iframe traversal | Covers the common case; nested iframes inherit their parent's configuration | Full tree traversal — performance cost for an uncommon scenario |
| Dual callback and postMessage paths | Zero migration burden for existing implementations | Breaking change — requires coordinated cross-team migration |

## Takeaways

- Frame context must be captured at the earliest possible point in the call flow, before any async operations.
- Permission sets must be independently configurable per frame. Inheriting permissions from the main frame defeats the purpose of scoping.
- Response routing to cross-origin frames requires a dispatch mechanism that runs in the main frame context — there is no shortcut around this.
- The FIFO queue pattern is a simple and effective solution for correlating asynchronous call contexts without adding protocol complexity.
