# GitHub PR Reverse Conversation

Browser extension for Firefox and Chrome that changes the conversation tab of GitHub pull requests:

- **Newest first:** the timeline is shown in reverse-chronological order.
- **Description on top:** the PR description stays at the very top, above the comment box.
- **Filter by reviewer:** a filter button next to each reviewer in the sidebar (left of the re-request review button) shows only that reviewer's comments and reviews. Click it again to show everything.

## Install

Clone this repository first, or download it from GitHub via **Code → Download ZIP** and unzip it.

### Firefox

Requires Firefox 142 or newer.

**Temporary (for trying it out).** The add-on is removed when Firefox restarts.

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and select `manifest.json` in the repository folder.

**Permanent.** Release Firefox only installs signed extensions, so pick one of these:

- **Sign it yourself** (unlisted, only you get it):
  1. Create API credentials at https://addons.mozilla.org/developers/addon/api/key/.
  2. Change `browser_specific_settings.gecko.id` in `manifest.json` to an ID of your own (for example `github-pr-reverse@your-name`). Each ID can only be signed by one account.
  3. In the repository folder, run:
     ```sh
     npx web-ext sign --channel=unlisted --api-key=<JWT issuer> --api-secret=<JWT secret>
     ```
     Signing usually finishes within minutes, but can take up to 24 hours.
  4. Open `about:addons`, click the gear icon, choose **Install Add-on From File…** and select the `.xpi` file from `web-ext-artifacts/`.
- **Use Firefox Developer Edition or Nightly without signing:**
  1. Set `xpinstall.signatures.required` to `false` in `about:config`.
  2. Run `npx web-ext build` in the repository folder.
  3. Install the `.zip` file from `web-ext-artifacts/` via `about:addons`, the gear icon, then **Install Add-on From File…**.

### Chrome, Edge, Brave and other Chromium browsers

1. Open `chrome://extensions` (`edge://extensions` in Edge).
2. Turn on **Developer mode**.
3. Click **Load unpacked** and select the repository folder.

Chrome warns about the unrecognized `browser_specific_settings` key. That section is only used by Firefox, so you can ignore the warning. The extension stays installed across restarts.

## Updating

Pull the latest changes, then:

- **Firefox, temporary:** click **Reload** on the extension in `about:debugging`.
- **Firefox, signed:** bump `version` in `manifest.json`, sign again and install the new `.xpi`.
- **Chrome:** click the reload icon on the extension in `chrome://extensions`.

Refresh any open GitHub tabs afterwards.

## Limitations

- The extension depends on GitHub's current page markup and may break when GitHub changes it.
- The filter matches each timeline item by its author, so a reviewer's replies in review threads started by someone else are hidden while filtering.
- Team reviewers don't get a filter button.
