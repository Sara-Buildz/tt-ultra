/**
 * TT ULTRA — Copilot-style chatbot (Phase B: UI + push layout + resize)
 * No API calls. Dummy replies only. Requires chatbot.css (auto-linked if missing).
 */
(function () {
    "use strict";

    const STORAGE_WIDTH = "tt_chatbot_width";
    const STORAGE_OPEN = "tt_chatbot_open";
    const MIN_WIDTH = 280;
    const DEFAULT_WIDTH = 380;
    const CSS_VAR_WIDTH = "--tt-chatbot-width";

    /** @type {{ panel: HTMLElement, main: HTMLElement, messages: HTMLElement, input: HTMLInputElement, resizer: HTMLElement, closeBtn: HTMLButtonElement, sendBtn: HTMLButtonElement, toggle: HTMLButtonElement } | null} */
    let ui = null;
    let isOpen = false;
    let isResizing = false;

    function syncOpenState() {
        isOpen = document.body.classList.contains("tt-chatbot-open");
        return isOpen;
    }

    function getToggleButton() {
        return /** @type {HTMLButtonElement | null} */ (document.getElementById("tt-chatbot-toggle"));
    }

    function updateToggleButton() {
        const toggle = getToggleButton();
        if (!toggle) {
            return;
        }
        if (isOpen) {
            toggle.setAttribute("aria-expanded", "true");
            toggle.setAttribute("aria-label", "Close TT Ultra assistant");
            toggle.classList.add("tt-chatbot-toggle--visible");
        } else {
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Open TT Ultra assistant");
            toggle.classList.remove("tt-chatbot-toggle--visible");
        }
    }

    function clampWidth(px) {
        const max = Math.floor(window.innerWidth * 0.5);
        return Math.min(Math.max(px, MIN_WIDTH), max);
    }

    function getSavedWidth() {
        const stored = parseInt(localStorage.getItem(STORAGE_WIDTH), 10);
        return clampWidth(Number.isFinite(stored) ? stored : DEFAULT_WIDTH);
    }

    function setPanelWidth(px) {
        const w = clampWidth(px);
        document.documentElement.style.setProperty(CSS_VAR_WIDTH, w + "px");
        localStorage.setItem(STORAGE_WIDTH, String(w));
        invalidateMap();
        return w;
    }

    function detectPageClass() {
        const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
        document.body.classList.add("tt-chatbot-ready");
        if (file === "index.html" || file === "") {
            document.body.classList.add("tt-page-index");
        }
        if (file === "login.html") {
            document.body.classList.add("tt-page-login");
        }
        if (file === "contact.html") {
            document.body.classList.add("tt-page-contact");
        }
    }

    function applyPageMainLayout(main) {
        main.style.width = "100%";
        const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
        if (file === "login.html") {
            main.style.minHeight = "100vh";
            main.style.display = "flex";
            main.style.alignItems = "center";
            main.style.justifyContent = "center";
        }
        if (file === "index.html" || file === "") {
            main.style.minHeight = "100vh";
        }
    }

    function ensureStylesheet() {
        if (document.querySelector('link[data-tt-chatbot="css"]')) {
            return;
        }
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "chatbot.css";
        link.setAttribute("data-tt-chatbot", "css");
        document.head.appendChild(link);
    }

    function invalidateMap() {
        if (typeof map !== "undefined" && map && typeof map.invalidateSize === "function") {
            setTimeout(function () {
                map.invalidateSize();
            }, 360);
        }
    }

    function wrapPageContent() {
        if (document.getElementById("tt-page-main")) {
            return document.getElementById("tt-page-main");
        }

        const main = document.createElement("div");
        main.id = "tt-page-main";

        const skip = new Set(["tt-page-main", "tt-chatbot-panel", "tt-chatbot-toggle"]);
        const nodes = Array.from(document.body.childNodes);
        nodes.forEach(function (node) {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) {
                    return;
                }
                main.appendChild(node);
                return;
            }
            const el = /** @type {HTMLElement} */ (node);
            if (skip.has(el.id)) {
                return;
            }
            main.appendChild(el);
        });

        document.body.insertBefore(main, document.body.firstChild);
        applyPageMainLayout(main);
        return main;
    }

    function createPanel() {
        const panel = document.createElement("aside");
        panel.id = "tt-chatbot-panel";
        panel.setAttribute("aria-label", "TT Ultra assistant");
        panel.setAttribute("aria-hidden", "true");

        const resizer = document.createElement("div");
        resizer.className = "tt-chatbot-resizer";
        resizer.setAttribute("role", "separator");
        resizer.setAttribute("aria-orientation", "vertical");
        resizer.setAttribute("aria-label", "Resize chat panel");
        resizer.tabIndex = 0;

        const sidebar = document.createElement("div");
        sidebar.className = "tt-chatbot-sidebar";

        const header = document.createElement("header");
        header.className = "tt-chatbot-header";

        const title = document.createElement("div");
        title.className = "tt-chatbot-header__title";
        title.innerHTML = 'TT <span>ASSISTANT</span>';

        const closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "tt-chatbot-close";
        closeBtn.id = "tt-chatbot-close";
        closeBtn.setAttribute("aria-label", "Close assistant");
        closeBtn.innerHTML = "&times;";

        header.appendChild(title);
        header.appendChild(closeBtn);

        const messages = document.createElement("div");
        messages.className = "tt-chatbot-messages";
        messages.id = "tt-chatbot-messages";
        messages.setAttribute("role", "log");
        messages.setAttribute("aria-live", "polite");

        const inputArea = document.createElement("div");
        inputArea.className = "tt-chatbot-input-area";

        const inputRow = document.createElement("div");
        inputRow.className = "tt-chatbot-input-row";

        const input = document.createElement("input");
        input.type = "text";
        input.className = "tt-chatbot-input";
        input.id = "tt-chatbot-input";
        input.placeholder = "Ask about tournaments, players...";
        input.autocomplete = "off";

        const sendBtn = document.createElement("button");
        sendBtn.type = "button";
        sendBtn.className = "tt-chatbot-send";
        sendBtn.id = "tt-chatbot-send";
        sendBtn.textContent = "Send";

        inputRow.appendChild(input);
        inputRow.appendChild(sendBtn);
        inputArea.appendChild(inputRow);

        sidebar.appendChild(header);
        sidebar.appendChild(messages);
        sidebar.appendChild(inputArea);
        panel.appendChild(resizer);
        panel.appendChild(sidebar);

        document.body.appendChild(panel);

        return {
            panel: panel,
            resizer: resizer,
            messages: messages,
            input: input,
            closeBtn: closeBtn,
            sendBtn: sendBtn,
        };
    }

    function createToggle() {
        if (document.getElementById("tt-chatbot-toggle")) {
            return /** @type {HTMLButtonElement} */ (document.getElementById("tt-chatbot-toggle"));
        }
        const btn = document.createElement("button");
        btn.type = "button";
        btn.id = "tt-chatbot-toggle";
        btn.setAttribute("aria-label", "Open TT Ultra assistant");
        btn.setAttribute("aria-expanded", "false");
        btn.textContent = "\u{1F4AC}";
        document.body.appendChild(btn);
        return btn;
    }

    function bubbleStyle(role) {
        const base =
            "max-width:88%;padding:10px 14px;border-radius:14px;font-size:0.9rem;line-height:1.45;word-wrap:break-word;";
        if (role === "user") {
            return (
                base +
                "align-self:flex-end;background:#3B1C63;color:#fff;border-bottom-right-radius:4px;"
            );
        }
        return (
            base +
            "align-self:flex-start;background:#f0f0f5;color:#3B1C63;border:1px solid #e8e8ee;border-bottom-left-radius:4px;"
        );
    }

    function appendMessage(role, text) {
        if (!ui) {
            return;
        }
        const el = document.createElement("div");
        el.className = "tt-chatbot-bubble tt-chatbot-bubble--" + role;
        el.setAttribute("data-role", role);
        el.style.cssText = bubbleStyle(role);
        if (document.body.classList.contains("dark") && role === "assistant") {
            el.style.background = "#2a2a2a";
            el.style.color = "#f5f5f5";
            el.style.borderColor = "#444";
        }
        el.textContent = text;
        ui.messages.appendChild(el);
        ui.messages.scrollTop = ui.messages.scrollHeight;
        return el;
    }

    function dummyReply(userText) {
        const t = userText.toLowerCase();
        if (t.includes("tournament") || t.includes("schedule")) {
            return "Stub: Check the Schedule page for 2026 tournaments across Lahore, Islamabad, and Karachi.";
        }
        if (t.includes("player") || t.includes("athlete")) {
            return "Stub: Visit Athletes to browse ranked players by region (Punjab, Sindh, KPK, and more).";
        }
        if (t.includes("team")) {
            return "Stub: Teams & Clubs lists academies like Lahore Table Tennis Club and Karachi TT Academy.";
        }
        if (t.includes("register") || t.includes("join")) {
            return "Stub: Use Register to sign up — limited slots apply for the 2026 season.";
        }
        return (
            "Stub: Thanks for your message! I'm the TT ULTRA assistant (offline demo). " +
            "API connection arrives in a later phase. You asked: \"" +
            userText.slice(0, 80) +
            (userText.length > 80 ? "…" : "") +
            "\""
        );
    }

    function sendMessage() {
        if (!ui) {
            return;
        }
        const text = ui.input.value.trim();
        if (!text) {
            return;
        }
        ui.input.value = "";
        appendMessage("user", text);
        ui.sendBtn.disabled = true;

        const thinkingEl = appendMessage("assistant", "Thinking...");
        const fallbackMsg = "AI assistant is temporarily unavailable.";

        fetch("http://localhost:3000/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        })
            .then(function (response) {
                return response.json().then(function (data) {
                    if (!response.ok) {
                        throw new Error(data.error || fallbackMsg);
                    }
                    return data;
                });
            })
            .then(function (data) {
                thinkingEl.textContent = data.reply || fallbackMsg;
            })
            .catch(function () {
                thinkingEl.textContent = fallbackMsg;
            })
            .finally(function () {
                ui.sendBtn.disabled = false;
                ui.input.focus();
                ui.messages.scrollTop = ui.messages.scrollHeight;
            });
    }

    function openChat() {
        document.body.classList.add("tt-chatbot-open");
        isOpen = true;
        if (ui) {
            ui.panel.setAttribute("aria-hidden", "false");
        }
        updateToggleButton();
        localStorage.setItem(STORAGE_OPEN, "1");
        invalidateMap();
        if (ui && ui.messages.childElementCount === 0) {
            appendMessage(
                "assistant",
                "Hello! I'm the TT ULTRA assistant (demo mode). Ask about tournaments, players, teams, or registration."
            );
        }
        if (ui) {
            ui.input.focus();
        }
    }

    function closeChat() {
        document.body.classList.remove("tt-chatbot-open");
        isOpen = false;
        if (ui) {
            ui.panel.setAttribute("aria-hidden", "true");
        }
        updateToggleButton();
        localStorage.setItem(STORAGE_OPEN, "0");
        invalidateMap();
    }

    function toggleChat(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        syncOpenState();
        if (isOpen) {
            closeChat();
        } else {
            openChat();
        }
    }

    function onCloseClick(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        closeChat();
    }

    function startResize(clientX) {
        isResizing = true;
        if (ui) {
            ui.resizer.classList.add("tt-chatbot-resizer--active");
        }
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        if (!isOpen) {
            openChat();
        }
        setPanelWidth(window.innerWidth - clientX);
    }

    function onResizeMove(clientX) {
        if (!isResizing) {
            return;
        }
        setPanelWidth(window.innerWidth - clientX);
    }

    function stopResize() {
        if (!isResizing) {
            return;
        }
        isResizing = false;
        if (ui) {
            ui.resizer.classList.remove("tt-chatbot-resizer--active");
        }
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
    }

    function bindResize() {
        if (!ui) {
            return;
        }

        ui.resizer.addEventListener("mousedown", function (e) {
            e.preventDefault();
            startResize(e.clientX);
        });

        ui.resizer.addEventListener("keydown", function (e) {
            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") {
                return;
            }
            e.preventDefault();
            if (!isOpen) {
                openChat();
            }
            const current = getSavedWidth();
            const step = e.key === "ArrowLeft" ? 24 : -24;
            setPanelWidth(current + step);
        });

        window.addEventListener("mousemove", function (e) {
            onResizeMove(e.clientX);
        });

        window.addEventListener("mouseup", stopResize);

        window.addEventListener("touchmove", function (e) {
            if (!isResizing || !e.touches[0]) {
                return;
            }
            onResizeMove(e.touches[0].clientX);
        }, { passive: true });

        ui.resizer.addEventListener("touchstart", function (e) {
            if (!e.touches[0]) {
                return;
            }
            e.preventDefault();
            startResize(e.touches[0].clientX);
        }, { passive: false });

        window.addEventListener("touchend", stopResize);

        window.addEventListener("resize", function () {
            setPanelWidth(getSavedWidth());
        });
    }

    function bindEvents(toggle, panelParts) {
        toggle.addEventListener("click", toggleChat);

        if (panelParts.closeBtn) {
            panelParts.closeBtn.addEventListener("click", onCloseClick);
        }

        if (panelParts.sendBtn) {
            panelParts.sendBtn.addEventListener("click", sendMessage);
        }

        if (panelParts.input) {
            panelParts.input.addEventListener("keydown", function (e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        document.addEventListener("keydown", function (e) {
            if (e.key !== "Escape") {
                return;
            }
            syncOpenState();
            if (isOpen) {
                e.preventDefault();
                closeChat();
            }
        });

        bindResize();
        updateToggleButton();
    }

    function init() {
        if (document.getElementById("tt-chatbot-panel")) {
            return;
        }

        ensureStylesheet();
        detectPageClass();
        setPanelWidth(getSavedWidth());

        const main = wrapPageContent();
        const panelParts = createPanel();
        const toggle = createToggle();

        ui = {
            panel: panelParts.panel,
            main: main,
            messages: panelParts.messages,
            input: panelParts.input,
            resizer: panelParts.resizer,
            closeBtn: panelParts.closeBtn,
            sendBtn: panelParts.sendBtn,
            toggle: toggle,
        };

        bindEvents(toggle, panelParts);

        if (localStorage.getItem(STORAGE_OPEN) === "1") {
            openChat();
        } else {
            closeChat();
            syncOpenState();
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
