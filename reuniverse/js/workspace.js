// Reuniverse workspace page: a small ZenHub-style Work Tracker.

(function () {
  "use strict";

  const BODIES = window.REUNIVERSE_BODIES || [];
  const STAGES = window.REUNIVERSE_STAGES || [];
  const PIPELINES = [
    { id: "backlog", name: "Backlog" },
    { id: "planning", name: "Planning" },
    { id: "building", name: "Building" },
    { id: "review", name: "Review" },
    { id: "live", name: "Live" }
  ];

  const titleEl = document.querySelector(".workspace-title");
  const subtitleEl = document.querySelector(".workspace-subtitle");
  const bodyNameEl = document.querySelector(".workspace-body-name");
  const stageEl = document.querySelector(".workspace-stage");
  const starsEl = document.querySelector(".workspace-stars");
  const issueForm = document.querySelector("#issue-form");
  const issueTitleInput = document.querySelector("#issue-title");
  const issuePipeline = document.querySelector("#issue-pipeline");
  const workspaceBody = document.querySelector(".workspace-body");
  const workspaceBoard = document.querySelector("#workspace-board");
  const workspaceStatus = document.querySelector("#workspace-status");
  const issueDetail = document.querySelector("#issue-detail");
  const issueDetailEmpty = document.querySelector(".issue-detail-empty");
  const issueDetailForm = document.querySelector("#issue-detail-form");
  const detailHeading = document.querySelector(".detail-heading");
  const detailTitle = document.querySelector("#detail-title");
  const detailBody = document.querySelector("#detail-body");
  const detailType = document.querySelector("#detail-type");
  const detailPoints = document.querySelector("#detail-points");
  const detailPipeline = document.querySelector("#detail-pipeline");
  const deleteIssueBtn = document.querySelector("#delete-issue-btn");

  let current = null;

  function stringHash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  function stageForStars(stars) {
    let result = STAGES[0];
    for (const stage of STAGES) {
      if (stars >= stage.threshold) result = stage;
    }
    return result;
  }

  function makeIssue(type, title, body, pipeline, points) {
    return {
      id: "issue-" + stringHash(title + "|" + body + "|" + Date.now() + "|" + Math.random()),
      type: type,
      title: title,
      body: body,
      pipeline: pipeline,
      points: points
    };
  }

  function defaultIssues(title, summary) {
    return [
      makeIssue(
        "Draft",
        title,
        summary || "Clarify the wedge, audience, and first artifact.",
        "backlog",
        1
      ),
      makeIssue(
        "Epoch",
        "Define first public artifact",
        "Turn the idea into a README, prototype, dataset, or research note.",
        "planning",
        3
      ),
      makeIssue(
        "Signal",
        "Publish and collect stars",
        "Stars advance civilization; GitHub repo stars stay separate.",
        "live",
        2
      )
    ];
  }

  function loadPlanetFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const title = params.get("title") || "ai4math #4";
    const summary = params.get("summary") || "Train a neural net to read a knot diagram and predict the s-invariant directly.";
    const bodyIndex = Number(params.get("body") || 0);
    const stars = Number(params.get("stars") || 612);
    const body = BODIES[bodyIndex] || BODIES[0];
    const issues = defaultIssues(title, summary);

    current = {
      title: title,
      summary: summary,
      body: body,
      stars: stars,
      issues: issues,
      activeIssueId: null
    };
  }

  function render() {
    const stage = stageForStars(current.stars);
    document.querySelector(".workspace-app").style.setProperty("--stage-color", stage.color);
    titleEl.textContent = current.title;
    subtitleEl.textContent = current.summary;
    bodyNameEl.textContent = current.body.designation;
    stageEl.textContent = "Stage " + stage.id + " / " + stage.name;
    starsEl.textContent = current.stars + " public stars";
    renderWorkspaceBoard();
    renderIssueDetail();
  }

  function renderWorkspaceBoard() {
    workspaceBoard.innerHTML = "";

    PIPELINES.forEach(function (pipeline) {
      const column = document.createElement("section");
      column.className = "kanban-column";
      column.dataset.pipeline = pipeline.id;
      column.setAttribute("aria-label", pipeline.name + " pipeline");

      const issues = current.issues.filter(function (issue) {
        return issue.pipeline === pipeline.id;
      });

      const header = document.createElement("div");
      header.className = "kanban-column-header";

      const heading = document.createElement("h3");
      heading.textContent = pipeline.name;

      const count = document.createElement("span");
      count.className = "issue-count";
      count.textContent = issues.length;

      header.appendChild(heading);
      header.appendChild(count);
      column.appendChild(header);

      const dropzone = document.createElement("div");
      dropzone.className = "kanban-dropzone";
      dropzone.dataset.pipeline = pipeline.id;
      dropzone.addEventListener("dragover", handleDragOver);
      dropzone.addEventListener("dragenter", handleDragEnter);
      dropzone.addEventListener("dragleave", handleDragLeave);
      dropzone.addEventListener("drop", handleDrop);

      if (issues.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-column";
        empty.textContent = "Drop issue here";
        dropzone.appendChild(empty);
      } else {
        issues.forEach(function (issue) {
          dropzone.appendChild(createIssueCard(issue));
        });
      }

      column.appendChild(dropzone);
      workspaceBoard.appendChild(column);
    });
  }

  function createIssueCard(issue) {
    const card = document.createElement("article");
    card.className = "issue-card";
    card.draggable = true;
    card.tabIndex = 0;
    card.dataset.issueId = issue.id;
    card.setAttribute("aria-label", issue.title + ", " + pipelineName(issue.pipeline));

    const typeEl = document.createElement("span");
    typeEl.className = "issue-type";
    typeEl.textContent = issue.type;

    const title = document.createElement("strong");
    title.textContent = issue.title;

    const meta = document.createElement("div");
    meta.className = "issue-meta";
    meta.textContent = issue.points + " pts / " + pipelineName(issue.pipeline);

    const controls = document.createElement("div");
    controls.className = "issue-controls";

    const previous = document.createElement("button");
    previous.type = "button";
    previous.className = "mini-btn";
    previous.textContent = "<";
    previous.setAttribute("aria-label", "Move " + issue.title + " left");
    previous.disabled = !neighborPipeline(issue.pipeline, -1);
    previous.addEventListener("click", function () {
      const target = neighborPipeline(issue.pipeline, -1);
      if (target) moveIssue(issue.id, target);
    });

    const next = document.createElement("button");
    next.type = "button";
    next.className = "mini-btn";
    next.textContent = ">";
    next.setAttribute("aria-label", "Move " + issue.title + " right");
    next.disabled = !neighborPipeline(issue.pipeline, 1);
    next.addEventListener("click", function () {
      const target = neighborPipeline(issue.pipeline, 1);
      if (target) moveIssue(issue.id, target);
    });

    controls.appendChild(previous);
    controls.appendChild(next);
    card.appendChild(typeEl);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(controls);

    if (issue.id === current.activeIssueId) {
      card.classList.add("is-selected");
      card.setAttribute("aria-current", "true");
    }

    card.addEventListener("dragstart", handleDragStart);
    card.addEventListener("dragend", handleDragEnd);
    card.addEventListener("click", function (event) {
      if (event.target.closest(".mini-btn")) return;
      openIssue(issue.id);
    });
    card.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openIssue(issue.id);
    });

    return card;
  }

  function pipelineName(pipelineId) {
    const pipeline = PIPELINES.find(function (item) { return item.id === pipelineId; });
    return pipeline ? pipeline.name : pipelineId;
  }

  function neighborPipeline(pipelineId, direction) {
    const index = PIPELINES.findIndex(function (item) { return item.id === pipelineId; });
    const neighbor = PIPELINES[index + direction];
    return neighbor ? neighbor.id : null;
  }

  function moveIssue(issueId, nextPipeline) {
    const issue = current.issues.find(function (item) { return item.id === issueId; });
    if (!issue || issue.pipeline === nextPipeline) return;
    issue.pipeline = nextPipeline;
    renderWorkspaceBoard();
    renderIssueDetail();
    announceWorkspace(issue.title + " moved to " + pipelineName(nextPipeline) + ".");
  }

  function selectedIssue() {
    return current.issues.find(function (issue) {
      return issue.id === current.activeIssueId;
    }) || null;
  }

  function openIssue(issueId) {
    current.activeIssueId = issueId;
    renderWorkspaceBoard();
    renderIssueDetail();
  }

  function renderIssueDetail() {
    const issue = selectedIssue();
    if (!issue) {
      workspaceBody.classList.remove("has-detail");
      issueDetail.hidden = true;
      issueDetailEmpty.hidden = true;
      issueDetailForm.hidden = true;
      return;
    }

    workspaceBody.classList.add("has-detail");
    issueDetail.hidden = false;
    issueDetailEmpty.hidden = true;
    issueDetailForm.hidden = false;
    detailHeading.textContent = issue.type + " / " + pipelineName(issue.pipeline);
    detailTitle.value = issue.title;
    detailBody.value = issue.body;
    detailType.value = issue.type;
    detailPoints.value = issue.points;
    detailPipeline.value = issue.pipeline;
  }

  function handleIssueCreate(event) {
    event.preventDefault();
    const title = (issueTitleInput.value || "").trim();
    if (!title) {
      issueTitleInput.focus();
      return;
    }

    const pipeline = issuePipeline.value;
    const issue = makeIssue(
      "Issue",
      title,
      "Created in the Reuniverse workspace demo. In the full product this can sync to GitHub.",
      pipeline,
      1
    );

    current.issues.push(issue);
    current.activeIssueId = issue.id;
    issueTitleInput.value = "";
    renderWorkspaceBoard();
    renderIssueDetail();
    announceWorkspace(title + " created in " + pipelineName(pipeline) + ".");
  }

  function handleIssueDetailSave(event) {
    event.preventDefault();
    const issue = selectedIssue();
    if (!issue) return;

    const title = (detailTitle.value || "").trim();
    if (!title) {
      detailTitle.focus();
      return;
    }

    issue.title = title;
    issue.body = (detailBody.value || "").trim();
    issue.type = detailType.value;
    issue.points = Math.max(0, Math.min(40, Number(detailPoints.value) || 0));
    issue.pipeline = detailPipeline.value;
    renderWorkspaceBoard();
    renderIssueDetail();
    announceWorkspace(issue.title + " saved.");
  }

  function handleIssueDelete() {
    const issue = selectedIssue();
    if (!issue) return;

    current.issues = current.issues.filter(function (item) {
      return item.id !== issue.id;
    });
    current.activeIssueId = null;
    renderWorkspaceBoard();
    renderIssueDetail();
    announceWorkspace(issue.title + " deleted.");
  }

  function handleDragStart(event) {
    event.currentTarget.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", event.currentTarget.dataset.issueId);
  }

  function handleDragEnd(event) {
    event.currentTarget.classList.remove("is-dragging");
    document.querySelectorAll(".kanban-dropzone").forEach(function (zone) {
      zone.classList.remove("is-drag-over");
    });
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDragEnter(event) {
    event.preventDefault();
    event.currentTarget.classList.add("is-drag-over");
  }

  function handleDragLeave(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      event.currentTarget.classList.remove("is-drag-over");
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    const issueId = event.dataTransfer.getData("text/plain");
    const pipeline = event.currentTarget.dataset.pipeline;
    event.currentTarget.classList.remove("is-drag-over");
    moveIssue(issueId, pipeline);
  }

  function announceWorkspace(message) {
    workspaceStatus.textContent = message;
  }

  issueForm.addEventListener("submit", handleIssueCreate);
  issueDetailForm.addEventListener("submit", handleIssueDetailSave);
  deleteIssueBtn.addEventListener("click", handleIssueDelete);
  loadPlanetFromUrl();
  render();
})();
