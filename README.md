# GitHub PR Reverse Conversation

Browser extension for Firefox and Chrome that changes the conversation tab of GitHub pull requests:

- **Newest first:** the timeline is shown in reverse-chronological order.
- **Description on top:** the PR description stays at the very top, above the comment box.
- **Filter by reviewer:** a filter button next to each reviewer in the sidebar (left of the re-request review button) shows only that reviewer's comments and reviews. Click it again to show everything.

## Install

### Firefox

Requires Firefox 142 or newer.

**From the latest release (recommended).**

1. Open the [latest release](https://github.com/petteramu/github-extension/releases/latest).
2. Click `github-pr-reverse.xpi` and allow the installation when Firefox asks. If Firefox downloads the file instead, drag it into a Firefox window.

Firefox installs new releases automatically.

**From source.** Clone this repository, or download it via **Code → Download ZIP** and unzip it. Then pick one of these:

- **Temporary (for trying it out).** The add-on is removed when Firefox restarts.
  1. Open `about:debugging#/runtime/this-firefox`.
  2. Click **Load Temporary Add-on…** and select `manifest.json` in the repository folder.
- **Sign it yourself** (unlisted, only you get it). Release Firefox only installs signed extensions.
  1. Create API credentials at https://addons.mozilla.org/developers/addon/api/key/.
  2. Change `browser_specific_settings.gecko.id` in `manifest.json` to an ID of your own (for example `github-pr-reverse@your-name`), and remove `update_url` next to it. Each ID can only be signed by one account.
  3. In the repository folder, run:
     ```sh
     npm install
     npx web-ext sign --channel=unlisted --api-key=<JWT issuer> --api-secret=<JWT secret>
     ```
     Signing usually finishes within minutes, but can take up to 24 hours.
  4. Open `about:addons`, click the gear icon, choose **Install Add-on From File…** and select the `.xpi` file from `web-ext-artifacts/`.
- **Firefox Developer Edition or Nightly, without signing.**
  1. Set `xpinstall.signatures.required` to `false` in `about:config`.
  2. Run `npm install` and then `npm run build` in the repository folder.
  3. Install the `.zip` file from `web-ext-artifacts/` via `about:addons`, the gear icon, then **Install Add-on From File…**.

### Chrome, Edge, Brave and other Chromium browsers

1. Download `github-pr-reverse.zip` from the [latest release](https://github.com/petteramu/github-extension/releases/latest) and unzip it. Alternatively, clone this repository or use **Code → Download ZIP**.
2. Open `chrome://extensions` (`edge://extensions` in Edge).
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select the unzipped folder.

Chrome warns about the unrecognized `browser_specific_settings` key. That section is only used by Firefox, so you can ignore the warning. The extension stays installed across restarts.

## Updating

- **Firefox, installed from a release:** automatic.
- **Firefox, temporary:** pull the latest changes and click **Reload** on the extension in `about:debugging`.
- **Firefox, signed yourself:** pull the latest changes, bump `version` in `manifest.json`, sign again and install the new `.xpi`.
- **Chrome:** replace the folder with the latest release (or pull the latest changes) and click the reload icon on the extension in `chrome://extensions`.

Refresh any open GitHub tabs afterwards.

## Releasing

Releases are built by [`.github/workflows/release.yml`](.github/workflows/release.yml).

**One-time setup:** create API credentials at https://addons.mozilla.org/developers/addon/api/key/ and add them as repository secrets named `AMO_JWT_ISSUER` and `AMO_JWT_SECRET` (**Settings → Secrets and variables → Actions**, or `gh secret set AMO_JWT_ISSUER`).

**To release:**

1. Bump `version` in `manifest.json`, commit and push.
2. Tag the commit with the same version and push the tag:
   ```sh
   git tag v1.0.2
   git push origin v1.0.2
   ```

The workflow signs the extension on addons.mozilla.org (unlisted), publishes a GitHub release with the signed `github-pr-reverse.xpi` and an unsigned `github-pr-reverse.zip`, and writes `updates.json` to `main` so installed copies update. Run `git pull` afterwards to get that commit.

The workflow waits up to an hour for Mozilla to approve the version. If it's picked for manual review and takes longer, the job fails. Re-running it won't work because the version is already uploaded, so bump the version and tag again once the review is done.

## Limitations

- The extension depends on GitHub's current page markup and may break when GitHub changes it.
- The filter matches each timeline item by its author, so a reviewer's replies in review threads started by someone else are hidden while filtering.
- Team reviewers don't get a filter button.
