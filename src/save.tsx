import {
  LaunchProps,
  getPreferenceValues,
  showToast,
  Toast,
  Clipboard,
  showHUD,
} from "@raycast/api";

interface Preferences {
  apiToken: string;
}

interface Arguments {
  path: string;
  content: string;
}

export default async function Command(
  props: LaunchProps<{ arguments: Arguments }>,
) {
  const { path, content } = props.arguments;
  const { apiToken } = getPreferenceValues<Preferences>();

  const cleanPath = path.trim().replace(/^\/+/, "");
  const shareUrl = `https://cl1p.net/${cleanPath}`;

  await showToast({ style: Toast.Style.Animated, title: "Saving..." });

  try {
    const response = await fetch(
      `https://api.cl1p.net/${encodeURIComponent(cleanPath)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          cl1papitoken: apiToken,
        },
        body: content,
      },
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      await showToast({
        style: Toast.Style.Failure,
        title: "Save failed",
        message: body || `HTTP ${response.status} — path may already be in use`,
      });
      return;
    }

    await Clipboard.copy(shareUrl);
    await showHUD(`Saved · ${shareUrl} copied to clipboard`);
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Network error",
      message: String(error),
    });
  }
}
