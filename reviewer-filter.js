// Adds a toggle next to each reviewer in the PR sidebar that hides every
// timeline item except that reviewer's comments and reviews.
(() => {
  // Conversation tab only.
  const PR_PATH = /^\/[^/]+\/[^/]+\/pull\/\d+\/?$/;
  const FILTER_ICON_PATH =
    "M.75 3h14.5a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1 0-1.5ZM3 7.75A.75.75 0 0 1 3.75 7h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 3 7.75Zm3 4a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z";

  // { path, reviewer } where reviewer is the normalized profile href, e.g. "/octocat".
  let active = null;

  const normalize = (href) => (href || "").replace(/\/+$/, "").toLowerCase();

  function filterIcon() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "octicon octicon-filter");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", FILTER_ICON_PATH);
    svg.append(path);
    return svg;
  }

  function reviewerRows() {
    const form = document.querySelector('form[id^="pull-request-reviewers-form"]');
    if (!form) return [];
    return [...form.querySelectorAll("[data-assignee-name]")]
      .filter((el) => el.dataset.hovercardType !== "team" && !el.closest("details"))
      .map((el) => ({
        row: el.parentElement,
        name: el.dataset.assigneeName,
        href: normalize(el.querySelector("a.assignee")?.getAttribute("href")),
      }))
      .filter((r) => r.href);
  }

  function createButton(name) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ghpr-filter-btn mr-2 btn-link muted-icon";
    btn.title = `Show only ${name}'s comments and reviews`;
    btn.setAttribute("aria-label", btn.title);
    const icon = document.createElement("span");
    icon.className = "reviewers-status-icon";
    icon.append(filterIcon());
    btn.append(icon);
    return btn;
  }

  function ensureButtons() {
    for (const { row, name, href } of reviewerRows()) {
      let btn = row.querySelector(".ghpr-filter-btn");
      if (!btn) {
        btn = createButton(name);
        const anchor =
          row.querySelector('button[name="re_request_reviewer_id"]') ||
          row.querySelector('a[id^="review-status-"]');
        if (anchor) anchor.before(btn);
        else row.append(btn);
      }
      btn.dataset.reviewer = href;
      btn.setAttribute("aria-pressed", String(active?.reviewer === href));
    }
  }

  // Delegated so buttons in DOM restored from Turbo's page cache (cloned, without listeners) still work.
  // Capture phase keeps the click away from GitHub's own handlers in the sidebar form.
  document.addEventListener(
    "click",
    (e) => {
      const btn = e.target.closest?.(".ghpr-filter-btn");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const reviewer = btn.dataset.reviewer;
      active = active?.reviewer === reviewer ? null : { path: location.pathname, reviewer };
      update();
    },
    true,
  );

  function timelineItems() {
    return [
      ...document.querySelectorAll(".js-discussion .js-timeline-item, .js-discussion .js-comment-container"),
    ].filter((el) => !el.parentElement.closest(".js-timeline-item, .js-comment-container"));
  }

  function isVisible(item, reviewer) {
    // Keep "Load more" pagination usable while filtering.
    if (item.querySelector(".ajax-pagination-form")) return true;
    if (!item.querySelector('[id^="issuecomment-"], [id^="pullrequestreview-"]')) return false;
    return normalize(item.querySelector("a.author")?.getAttribute("href")) === reviewer;
  }

  function applyFilter() {
    if (!active) {
      for (const el of document.querySelectorAll(".ghpr-hidden")) el.classList.remove("ghpr-hidden");
      return;
    }
    for (const item of timelineItems()) {
      item.classList.toggle("ghpr-hidden", !isVisible(item, active.reviewer));
    }
  }

  function update() {
    if (!PR_PATH.test(location.pathname)) {
      active = null;
      return;
    }
    if (active && active.path !== location.pathname) active = null;
    ensureButtons();
    applyFilter();
  }

  // GitHub re-renders the sidebar and timeline in place (Turbo, live updates,
  // "Load more"), so re-run on DOM changes, at most once per frame.
  let scheduled = false;
  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      update();
    });
  }).observe(document.documentElement, { childList: true, subtree: true });

  update();
})();
