(function() {
  "use strict";

  // State
  var allTemplates = [];
  var filteredTemplates = [];
  var debounceTimer = null;
  var realtimeSubscription = null;
  var userId = null;
  var currentTemplateId = null;
  var allFolders = [];
  var activeFolderId = null;
  var quill = null;
  var _config = typeof MinutarioConfig !== "undefined" ? MinutarioConfig : {};

  function getSb() {
    try { if (window.parent && window.parent._supabaseClient) return window.parent._supabaseClient; } catch (e) {}
    return window._supabaseClient || null;
  }

  // DOM cache
  var els = {};

  function cacheElements() {
    els.loginScreen = document.getElementById("supabase-modal");
    els.dashboardScreen = document.getElementById("dashboard-grid"); // actually main.dashboard-grid, doesn't have id but let's just toggle modal
    els.loginForm = null; // No form tag for login
    els.loginEmail = document.getElementById("sb-email");
    els.loginPassword = document.getElementById("sb-password");
    els.loginBtn = document.getElementById("sb-login");
    els.loginCloseBtn = document.getElementById("sb-close");
    els.loginError = document.getElementById("login-error"); // We'll just use showToast if this is missing
    els.logoutBtn = document.getElementById("logout-btn");
    els.downloadExtBtn = document.getElementById("download-ext");
    els.syncBtn = document.getElementById("supabase-sync");
    els.searchInput = document.getElementById("search-input") || document.getElementById("search");
    els.templateList = document.getElementById("template-list");
    els.emptyState = document.getElementById("empty-state");
    els.syncBadge = document.getElementById("sync-badge");
    els.toast = document.getElementById("toast");

    // Editor elements
    els.editorForm = document.getElementById("editor-form");
    els.tplName = document.getElementById("tpl-name");
    els.tplShortcut = document.getElementById("tpl-shortcut");
    els.tplFolder = document.getElementById("tpl-folder");
    els.shortcutError = document.getElementById("shortcut-error");
    els.newTemplateBtn = document.getElementById("new-template");
    els.deleteTemplateBtn = document.getElementById("delete-template");
    els.folderList = document.getElementById("folder-list");
    els.newFolderBtn = document.getElementById("new-folder");
    els.deleteFolderBtn = document.getElementById("delete-folder");
    els.quillEditor = document.getElementById("quill-editor");
  }

  // Utilities
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function stripHtml(html) {
    if (!html) return "";
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  function showToast(message) {
    if (!els.toast) return;
    var item = document.createElement("div");
    item.className = "toast-item";
    item.textContent = message;
    els.toast.appendChild(item);
    window.setTimeout(function() {
      item.remove();
    }, 2500);
  }

  function getFolderOrder(folder) {
    if (!folder) return 0;
    if (typeof folder.order_idx === "number") return folder.order_idx;
    if (typeof folder.order === "number") return folder.order;
    return 0;
  }

  function sortFolders(folders) {
    return (folders || []).slice().sort(function(a, b) {
      var orderDiff = getFolderOrder(a) - getFolderOrder(b);
      if (orderDiff !== 0) return orderDiff;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  }

  function notifyTemplatesUpdated() {
    if (!window.chrome || !chrome.tabs || !chrome.tabs.query || !chrome.tabs.sendMessage) {
      return Promise.resolve();
    }

    return chrome.tabs.query({}).then(function(tabs) {
      return Promise.all((tabs || []).map(function(tab) {
        if (typeof tab.id !== "number") {
          return Promise.resolve();
        }
        return chrome.tabs.sendMessage(tab.id, { type: "TEMPLATES_UPDATED" }).catch(function() {
          return undefined;
        });
      }));
    }).then(function() {
      return undefined;
    }).catch(function() {
      return undefined;
    });
  }

  // Auth helpers
  function getStoredTokens() {
    return {
      accessToken: localStorage.getItem("minutario_access_token"),
      refreshToken: localStorage.getItem("minutario_refresh_token")
    };
  }

  function saveTokens(session) {
    localStorage.setItem("minutario_access_token", session.access_token);
    localStorage.setItem("minutario_refresh_token", session.refresh_token);
    chrome.storage.local.set({
      minutario_access_token: session.access_token,
      minutario_refresh_token: session.refresh_token
    });
  }

  function clearTokens() {
    localStorage.removeItem("minutario_access_token");
    localStorage.removeItem("minutario_refresh_token");
    localStorage.removeItem("minutario_user_id");
    chrome.storage.local.remove([
      "minutario_access_token",
      "minutario_refresh_token",
      "minutario_user_id"
    ]);
  }

function getUserIdFromUser(user) {
    return (user && user.id) || null;
  }

  async function getStoredUserId() {
    var storedUserId = localStorage.getItem("minutario_user_id");
    if (storedUserId) return storedUserId;

    if (window.chrome && chrome.storage && chrome.storage.local && chrome.storage.local.get) {
      var result = await chrome.storage.local.get("minutario_user_id");
      return result && result.minutario_user_id ? result.minutario_user_id : null;
    }

    return null;
  }

  async function saveUserId(value) {
    if (!value) return;
    userId = value;
    localStorage.setItem("minutario_user_id", value);

    if (window.chrome && chrome.storage && chrome.storage.local && chrome.storage.local.set) {
      await chrome.storage.local.set({ minutario_user_id: value });
    }
  }

  // Screen management
  function showLoginScreen() {
    if (els.loginScreen) els.loginScreen.classList.remove("hidden");
  }

  function showDashboardScreen() {
    if (els.loginScreen) els.loginScreen.classList.add("hidden");
  }

  function getFolderById(id) {
    for (var i = 0; i < allFolders.length; i++) {
      if (allFolders[i].id === id) return allFolders[i];
    }
    return null;
  }

  function setActiveFolder(folderId) {
    activeFolderId = folderId || null;
    renderFolderList();
    filterAndRender();
    if (els.deleteFolderBtn) {
      els.deleteFolderBtn.disabled = !activeFolderId;
    }
  }

  function populateFolderSelect() {
    if (!els.tplFolder) return;

    els.tplFolder.innerHTML = "";

    var emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Sem pasta";
    els.tplFolder.appendChild(emptyOption);

    sortFolders(allFolders).forEach(function(folder) {
      var option = document.createElement("option");
      option.value = folder.id;
      option.textContent = folder.name || "Sem nome";
      els.tplFolder.appendChild(option);
    });
  }

  function renderFolderList() {
    if (!els.folderList) return;
    els.folderList.innerHTML = "";

    sortFolders(allFolders).forEach(function(folder) {
      var li = document.createElement("li");
      li.className = "folder-item";
      if (folder.id === activeFolderId) {
        li.classList.add("active");
      }
      li.textContent = folder.name || "Sem nome";
      li.dataset.id = folder.id;
      li.addEventListener("click", function() {
        setActiveFolder(folder.id === activeFolderId ? null : folder.id);
      });
      els.folderList.appendChild(li);
    });
  }

  async function loadFolders() {
    try {
      var sb = getSb();
      var folders = [];
      if (sb && userId) {
        var fRes = await sb.from("minutario_folders").select("*").eq("user_id", userId);
        if (fRes.data) {
          folders = fRes.data.map(function(f) { return { id: f.id, name: f.name || "" }; });
        }
      }
      allFolders = folders || [];
      populateFolderSelect();
      renderFolderList();
      if (els.deleteFolderBtn) {
        els.deleteFolderBtn.disabled = !activeFolderId;
      }
    } catch (err) {
      console.error("Load folders error:", err);
      showToast("Erro ao carregar pastas");
    }
  }

  // Sync badge (optional if not in DOM)
  function updateSyncBadge(state) {
    var badge = els.syncBadge;
    if (!badge) return;
    badge.className = "sync-badge";
    if (state === "idle") {
      badge.classList.add("sync-idle");
      badge.textContent = "Sincronizado";
    } else if (state === "syncing") {
      badge.classList.add("sync-syncing");
      badge.textContent = "Sincronizando...";
    } else if (state === "updated") {
      badge.classList.add("sync-updated");
      badge.textContent = "Atualizado";
    } else if (state === "error" || state === "offline") {
      badge.classList.add("sync-error");
      badge.textContent = "Erro";
    }
  }

  // Login
  async function handleLogin(event) {
    if (event) event.preventDefault();
    var email = els.loginEmail.value.trim();
    if (email && !email.includes("@")) {
      email = email + "@tjpr.jus.br";
    }
    var password = els.loginPassword.value;

    try {
      var client = window.MinutarioAPI.getClient();
      if (!client) {
        throw new Error("Cliente Supabase não disponível");
      }

      var result = await client.auth.signInWithPassword({ email: email, password: password });
      if (result.error) {
        throw result.error;
      }

      var session = result.data.session;
      var user = result.data.user;

      if (!session) {
        throw new Error("Sessão não retornada");
      }

      saveTokens(session);

      await saveUserId(getUserIdFromUser(user));

      if (els.loginError) els.loginError.textContent = "";
      else showToast("Login efetuado com sucesso!");
      showDashboardScreen();
      await initDashboard();
      
      // Auto-sync after login
      showToast("Iniciando sincronização...");
      if (els.syncBtn) els.syncBtn.click();
    } catch (err) {
      if (els.loginError) els.loginError.textContent = err.message || "Erro ao fazer login";
      else showToast(err.message || "Erro ao fazer login");
    }
  }

  // Logout
  async function handleLogout() {
    try {
      var client = window.MinutarioAPI.getClient();
      if (client) {
        await client.auth.signOut();
      }
    } catch (e) {
      // ignore
    }

    if (realtimeSubscription) {
      try {
        realtimeSubscription.unsubscribe();
      } catch (e) {
        // ignore
      }
      realtimeSubscription = null;
    }

    clearTokens();
    await window.MinutarioDB.deleteAllTemplates();

    allTemplates = [];
    filteredTemplates = [];
    userId = null;

    showLoginScreen();
  }

  // Templates
  async function loadTemplates() {
    try {
      var sb = getSb();
      if (sb) {
        var userResult = await sb.auth.getUser();
        userId = userResult.data && userResult.data.user ? userResult.data.user.id : null;
        if (userId) {
          var tRes = await sb.from("minutario_templates").select("*").eq("user_id", userId);
          if (tRes.data) {
            allTemplates = tRes.data.map(function(t) {
              return { id: t.id, name: t.name || "", shortcut: t.shortcut || "", folderId: t.folder_id || null, content: t.content || "", updatedAt: t.updated_at || "", createdAt: t.created_at || "" };
            });
            filterAndRender();
            return;
          }
        }
      }
      allTemplates = [];
      filterAndRender();
    } catch (err) {
      console.error("Load templates error:", err);
    }
  }

  function filterAndRender() {
    var query = els.searchInput ? els.searchInput.value.trim().toLowerCase() : "";
    var candidates = allTemplates.filter(function(t) {
      var folderId = t.folderId || null;
      return !activeFolderId || folderId === activeFolderId;
    });

    if (!query) {
      filteredTemplates = candidates.slice();
    } else {
      filteredTemplates = candidates.filter(function(t) {
        var nameMatch = t.name && t.name.toLowerCase().indexOf(query) !== -1;
        var shortcutMatch = t.shortcut && t.shortcut.toLowerCase().indexOf(query) !== -1;
        var contentMatch = t.content && t.content.toLowerCase().indexOf(query) !== -1;
        return nameMatch || shortcutMatch || contentMatch;
      });
    }

    renderTemplateList();
  }

  function renderTemplateList() {
    if (!els.templateList) return;
    els.templateList.innerHTML = "";

    if (filteredTemplates.length === 0) {
      els.templateList.classList.add("hidden");
      if (els.emptyState) els.emptyState.classList.remove("hidden");
      return;
    }

    els.templateList.classList.remove("hidden");
    if (els.emptyState) els.emptyState.classList.add("hidden");

    var fragment = document.createDocumentFragment();

    filteredTemplates.forEach(function(template, index) {
      var li = document.createElement("li");
      li.className = "template-item";
      li.dataset.id = template.id;
      li.dataset.index = String(index);

      var numberBadge = document.createElement("div");
      numberBadge.className = "template-number";
      numberBadge.textContent = String(index + 1);
      li.appendChild(numberBadge);

      var info = document.createElement("div");
      info.className = "template-info";

      var nameEl = document.createElement("div");
      nameEl.className = "template-name";
      nameEl.textContent = template.name || "Sem nome";
      info.appendChild(nameEl);

      var meta = document.createElement("div");
      meta.className = "template-meta";

      var shortcutEl = document.createElement("span");
      shortcutEl.className = "template-shortcut";
      shortcutEl.textContent = template.shortcut || "";
      meta.appendChild(shortcutEl);

      if (template.usage_count !== undefined && template.usage_count !== null) {
        var usageEl = document.createElement("span");
        usageEl.className = "template-usage";
        usageEl.textContent = template.usage_count + " uso" + (template.usage_count === 1 ? "" : "s");
        meta.appendChild(usageEl);
      }

      info.appendChild(meta);
      li.appendChild(info);

      li.addEventListener("click", function() {
        if (quill && els.editorForm) {
          loadTemplateIntoEditor(template);
        } else {
          copyTemplate(template);
        }
      });

      fragment.appendChild(li);
    });

    els.templateList.appendChild(fragment);
  }

  // Clipboard
  async function copyTemplate(template) {
    var name = template.name || "Template";
    var plainText = template.plain_text || "";
    var htmlContent = template.html_content || "";

    if (!plainText && !htmlContent && template.content) {
      htmlContent = template.content;
      plainText = stripHtml(template.content);
    }

    if (!plainText && htmlContent) {
      plainText = stripHtml(htmlContent);
    }

    var textToCopy = plainText || htmlContent || "";

    try {
      if (navigator.clipboard && navigator.clipboard.write && htmlContent) {
        var blobHtml = new Blob([htmlContent], { type: "text/html" });
        var blobText = new Blob([plainText || htmlContent], { type: "text/plain" });
        var item = new ClipboardItem({
          "text/html": blobHtml,
          "text/plain": blobText
        });
        await navigator.clipboard.write([item]);
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        throw new Error("Clipboard não suportado");
      }

      showToast("'" + name + "' copiado! Cole com Ctrl+V");
    } catch (err) {
      console.error("Copy error:", err);
      showToast("Erro ao copiar template");
    }
  }

  function copyTemplateAtIndex(index) {
    if (index >= 0 && index < filteredTemplates.length) {
      copyTemplate(filteredTemplates[index]);
    }
  }

  // Search
  function handleSearchInput() {
    if (debounceTimer) {
      window.clearTimeout(debounceTimer);
    }
    debounceTimer = window.setTimeout(function() {
      filterAndRender();
    }, 150);
  }

  function showShortcutError(message) {
    if (els.shortcutError) {
      els.shortcutError.textContent = message || "";
    }
  }

  function getTemplateById(id) {
    for (var i = 0; i < allTemplates.length; i++) {
      if (allTemplates[i].id === id) return allTemplates[i];
    }
    return null;
  }

  function getDuplicateShortcut(shortcut) {
    var normalized = shortcut.toLowerCase();
    for (var i = 0; i < allTemplates.length; i++) {
      var template = allTemplates[i];
      if (template.id !== currentTemplateId && (template.shortcut || "").toLowerCase() === normalized) {
        return template;
      }
    }
    return null;
  }

  // Editor logic
  function initEditor() {
    if (!els.quillEditor) return;
    quill = new Quill('#quill-editor', {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['clean']
        ]
      }
    });
  }

  function handleNewTemplate() {
    currentTemplateId = null;
    if (els.editorForm) els.editorForm.reset();
    if (quill && quill.setContents) quill.setContents([]);
    else if (quill && quill.root) quill.root.innerHTML = "";
    if (els.tplFolder) els.tplFolder.value = activeFolderId || "";
    if (els.deleteTemplateBtn) els.deleteTemplateBtn.style.display = 'none';
  }

  function loadTemplateIntoEditor(template) {
    currentTemplateId = template.id;
    if (els.tplName) els.tplName.value = template.name || "";
    if (els.tplShortcut) els.tplShortcut.value = template.shortcut || "";
    if (els.tplFolder) els.tplFolder.value = template.folder_id || template.folderId || "";
    if (quill) {
      quill.root.innerHTML = template.content || template.html_content || "";
    }
    if (els.deleteTemplateBtn) els.deleteTemplateBtn.style.display = 'inline-block';
  }

  async function handleSaveTemplate(event) {
    event.preventDefault();
    if (!quill) return;

    var shortcut = els.tplShortcut.value.trim().replace(/^\//, '').toLowerCase();
    var duplicate = getDuplicateShortcut(shortcut);
    if (duplicate) {
      showShortcutError('Atalho já em uso pelo template "' + (duplicate.name || "Sem nome") + '".');
      return;
    }
    showShortcutError("");

    var existing = currentTemplateId ? getTemplateById(currentTemplateId) : null;
    var folderValue = els.tplFolder ? els.tplFolder.value || null : null;
    var folderId = folderValue || (existing ? existing.folder_id || existing.folderId || null : null);
    var now = new Date();
    var nowIso = now.toISOString();
    var nowMs = now.getTime();

    var tpl = {
      id: currentTemplateId || crypto.randomUUID(),
      name: els.tplName.value.trim(),
      shortcut: shortcut,
      folder_id: folderId,
      folderId: folderId,
      content: quill.root.innerHTML,
      plain_text: quill.getText(),
      user_id: userId || null,
      updated_at: nowIso,
      updatedAt: nowMs
    };

    tpl.created_at = existing && existing.created_at ? existing.created_at : nowIso;
    tpl.createdAt = existing && existing.createdAt ? existing.createdAt : nowMs;

    try {
      var sb = getSb();
      if (!sb) {
        showToast("Supabase não disponível");
        return;
      }

      var payload = {
        id: tpl.id,
        user_id: userId,
        folder_id: tpl.folderId || null,
        name: tpl.name || "",
        shortcut: tpl.shortcut || "",
        content: tpl.content || "",
        created_at: tpl.created_at || nowIso,
        updated_at: nowIso
      };

      await sb.from("minutario_templates").upsert(payload, { onConflict: "id" });

      // Salva também no IndexedDB local para sync imediato com a extensão
      if (window.MinutarioDB) {
        await window.MinutarioDB.saveTemplate(tpl);
      }

      currentTemplateId = tpl.id;
      showToast("Template salvo com sucesso!");
      await loadTemplates();
      notifyTemplatesUpdated();
    } catch (err) {
      console.error(err);
      showToast("Erro ao salvar template");
    }
  }

  async function handleDeleteTemplate() {
    if (!currentTemplateId) return;
    if (!confirm("Tem certeza que deseja excluir este template?")) return;

    var deletedId = currentTemplateId;
    try {
      var sb = getSb();
      if (sb && userId) {
        await sb.from("minutario_templates").delete().eq("id", deletedId).eq("user_id", userId);
      }

      showToast("Template excluído!");
      handleNewTemplate();
      allTemplates = allTemplates.filter(function(t) { return t.id !== deletedId; });
      filterAndRender();

      // Remove do IndexedDB local para sync imediato com a extensão
      if (window.MinutarioDB) {
        await window.MinutarioDB.deleteTemplate(deletedId);
      }

      notifyTemplatesUpdated();
    } catch (err) {
      console.error(err);
      showToast("Erro ao excluir template");
    }
  }

  async function handleNewFolder() {
    var sb = getSb();
    if (!sb || !userId) {
      showToast("Faça login no Supabase primeiro");
      return;
    }

    var name = prompt("Nome da pasta:");
    if (!name) return;

    name = name.trim();
    if (!name) return;

    var folder = {
      id: crypto.randomUUID(),
      user_id: userId,
      name: name,
      order_idx: allFolders.length,
      created_at: new Date().toISOString()
    };

    try {
      await sb.from("minutario_folders").insert(folder);

      // Salva também no IndexedDB local
      if (window.MinutarioDB) {
        await window.MinutarioDB.saveFolder(folder);
      }

      await loadFolders();
      setActiveFolder(folder.id);
      if (els.tplFolder) els.tplFolder.value = folder.id;
      showToast("Pasta criada com sucesso!");
      notifyTemplatesUpdated();
    } catch (err) {
      console.error(err);
      showToast("Erro ao criar pasta");
    }
  }

  async function handleDeleteFolder() {
    if (!activeFolderId) return;

    var linkedTemplates = allTemplates.filter(function(template) {
      return (template.folderId || null) === activeFolderId;
    });

    if (linkedTemplates.length > 0) {
      showToast("Remova ou mova os templates da pasta antes de excluí-la");
      return;
    }

    if (!confirm("Tem certeza que deseja excluir esta pasta?")) return;

    try {
      var sb = getSb();
      if (sb && userId) {
        await sb.from("minutario_folders").delete().eq("id", activeFolderId).eq("user_id", userId);
      }
      var deletedFolderId = activeFolderId;
      activeFolderId = null;

      // Remove do IndexedDB local
      if (window.MinutarioDB && deletedFolderId) {
        await window.MinutarioDB.deleteFolder(deletedFolderId);
      }

      await loadFolders();
      filterAndRender();
      if (els.tplFolder) els.tplFolder.value = "";
      showToast("Pasta excluída!");
      notifyTemplatesUpdated();
    } catch (err) {
      console.error(err);
      showToast("Erro ao excluir pasta");
    }
  }

  // Keyboard shortcuts
  function handleKeydown(event) {
    var searchFocused = document.activeElement === els.searchInput;

    // Ctrl+1 to Ctrl+9
    if (event.ctrlKey && !event.altKey && !event.metaKey) {
      var keyNum = parseInt(event.key, 10);
      if (keyNum >= 1 && keyNum <= 9) {
        event.preventDefault();
        copyTemplateAtIndex(keyNum - 1);
        return;
      }
    }

    // Enter on search copies first result
    if (event.key === "Enter" && searchFocused && filteredTemplates.length > 0) {
      event.preventDefault();
      copyTemplate(filteredTemplates[0]);
      return;
    }

    // Escape clears search
    if (event.key === "Escape") {
      if (!els.searchInput) return;
      if (els.searchInput.value !== "") {
        els.searchInput.value = "";
        filterAndRender();
      }
      els.searchInput.blur();
    }
  }

  // Realtime
  function subscribeRealtime() {
    if (!userId || !window.MinutarioAPI.subscribeToTemplates) {
      return;
    }

    realtimeSubscription = window.MinutarioAPI.subscribeToTemplates(userId, function(payload) {
      loadTemplates();
    });
  }

  // Init dashboard after login
  async function initDashboard() {
    showDashboardScreen();
    updateSyncBadge("idle");

    if (window.MinutarioSync && window.MinutarioSync.onSyncStateChange) {
      window.MinutarioSync.onSyncStateChange(function(state) {
        updateSyncBadge(state);
      });
    }

    await loadFolders();
    await loadTemplates();

    if (userId) {
      subscribeRealtime();
    }

    initEditor();
    handleNewTemplate();
  }

  async function attemptSeamlessSSO(sb) {
    try {
      var tabs = await chrome.tabs.query({ url: "*://*/*" });
      for (var i = 0; i < tabs.length; i++) {
        try {
          var resp = await chrome.tabs.sendMessage(tabs[i].id, { type: "GET_SUPABASE_TOKEN" });
          if (resp && resp.ok && resp.access_token) {
            var result = await sb.auth.setSession({
              access_token: resp.access_token,
              refresh_token: resp.refresh_token
            });
            if (result.data && result.data.session) {
              saveTokens(result.data.session);
              return {
                session: result.data.session,
                user: result.data.user
              };
            }
          }
        } catch (e) {
          // ignora abas sem content script
        }
      }
    } catch(err) {
      console.warn("SSO failed:", err);
    }
    return null;
  }

  // App init
  async function init() {
    var sb = getSb();
    if (sb) {
      try {
        var userResult = await sb.auth.getUser();
        if (!userResult.data || !userResult.data.user) {
          // Tentativa de SSO via token do Módulo Web
          var ssoResult = await attemptSeamlessSSO(sb);
          if (ssoResult && ssoResult.user) {
            userResult = { data: { user: ssoResult.user } };
            showToast("Login automático sincronizado com o módulo!");
          }
        }

        if (userResult.data && userResult.data.user) {
          userId = userResult.data.user.id;
          await saveUserId(userId);
          showDashboardScreen();
          await loadFolders();
          await loadTemplates();
          initEditor();
          handleNewTemplate();
          
          if (els.syncBtn) els.syncBtn.click();
          return;
        }
      } catch (err) {
        console.warn("Auth check failed:", err);
      }
    }

    if (els.loginScreen) {
      showLoginScreen();
    } else {
      await initDashboard();
    }
  }

  // Download Extension
  var EXTENSION_FILES = [
    'manifest.json', 'background.js', 'content.js',
    'shared/config.js', 'shared/config.example.js', 'shared/db.js', 'shared/api.js', 'shared/sync.js',
    'popup/popup.html', 'popup/popup.js', 'popup/popup.css',
    'quick-access/quick-access.html', 'quick-access/quick-access.js', 'quick-access/quick-access.css',
    'dashboard/index.html', 'dashboard/dashboard.html', 'dashboard/dashboard.js', 'dashboard/dashboard.css',
    'dashboard/manifest.json', 'dashboard/sw.js',
    'dashboard/sync/index.js', 'dashboard/sync/csv.js', 'dashboard/sync/supabase.js',
    'icons/icon16.png', 'icons/icon48.png', 'icons/icon128.png',
    'lib/papaparse.min.js', 'lib/supabase.min.js', 'lib/quill.min.js', 'lib/quill.snow.css',
    'README.md'
  ];

  async function handleDownloadExt() {
    var JSZip = (typeof parent !== 'undefined' && parent.JSZip) || window.JSZip;
    if (!JSZip) {
      showToast('JSZip não disponível. Tente pela página principal.');
      return;
    }
    var zip = new JSZip();
    var loaded = 0;
    for (var i = 0; i < EXTENSION_FILES.length; i++) {
      var filePath = EXTENSION_FILES[i];
      try {
        var res = await fetch('../' + filePath);
        if (!res.ok) continue;
        var blob = await res.blob();
        zip.file(filePath, blob);
        loaded++;
      } catch (e) { }
    }
    if (loaded === 0) {
      showToast('Erro ao carregar arquivos da extensão.');
      return;
    }
    var content = await zip.generateAsync({ type: 'blob' });
    var url = URL.createObjectURL(content);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'minutario-extensao.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Extensão gerada (' + loaded + ' arquivos)!');
  }

  // Events
  function bindEvents() {
    if (els.loginForm) els.loginForm.addEventListener("submit", handleLogin);
    if (els.loginBtn) els.loginBtn.addEventListener("click", handleLogin);
    if (els.loginCloseBtn) els.loginCloseBtn.addEventListener("click", showDashboardScreen);
    if (els.syncBtn) {
      els.syncBtn.addEventListener("click", async function(event) {
        if (event) event.preventDefault();
        if (!userId) {
          showLoginScreen();
          return;
        }
        showToast("Sincronizando com Supabase...");
        updateSyncBadge("syncing");
        try {
          var response = await chrome.runtime.sendMessage({ type: "FORCE_SYNC" });
          if (response && response.ok && response.data) {
            if (response.data.updated) {
              showToast("Sincronizado: " + (response.data.count || 0) + " templates atualizados!");
              updateSyncBadge("updated");
              await loadTemplates();
            } else {
              showToast("Sincronização concluída. Nenhum template novo.");
              updateSyncBadge("idle");
            }
          } else {
            showToast("Erro ao sincronizar.");
            updateSyncBadge("error");
          }
        } catch (e) {
          showToast("Erro de comunicação ao sincronizar.");
          updateSyncBadge("error");
        }
      });
    }
    if (els.logoutBtn) els.logoutBtn.addEventListener("click", handleLogout);
    if (els.searchInput) els.searchInput.addEventListener("input", handleSearchInput);
    if (els.newTemplateBtn) els.newTemplateBtn.addEventListener("click", handleNewTemplate);
    if (els.editorForm) els.editorForm.addEventListener("submit", handleSaveTemplate);
    if (els.deleteTemplateBtn) els.deleteTemplateBtn.addEventListener("click", handleDeleteTemplate);
    if (els.newFolderBtn) els.newFolderBtn.addEventListener("click", handleNewFolder);
    if (els.deleteFolderBtn) els.deleteFolderBtn.addEventListener("click", handleDeleteFolder);
    if (els.downloadExtBtn) els.downloadExtBtn.addEventListener("click", handleDownloadExt);
    document.addEventListener("keydown", handleKeydown);
  }

  cacheElements();
  bindEvents();
  init();

  // Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(console.error);
  }
})();
