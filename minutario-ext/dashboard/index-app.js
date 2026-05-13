(function() {
  "use strict";

  // Obtém cliente Supabase via shared/api.js (já carregado antes deste script)
  var SUPABASE_URL = (typeof MinutarioConfig !== "undefined" && MinutarioConfig.SUPABASE_URL) || "https://ifkhwqfxtdfbotifxfzq.supabase.co";
  var SUPABASE_ANON_KEY = (typeof MinutarioConfig !== "undefined" && MinutarioConfig.SUPABASE_ANON_KEY) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlma2h3cWZ4dGRmYm90aWZ4ZnpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTc0ODksImV4cCI6MjA5MzU3MzQ4OX0.iN5PKFougk2xfpI_etHzJSJxn4egN6kd-_8dV-sSCwM";

  var sb = null;
  if (typeof MinutarioAPI !== "undefined" && MinutarioAPI.getClient) {
    sb = MinutarioAPI.getClient();
  }
  if (!sb && typeof supabase !== "undefined" && supabase.createClient) {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  var userId = null;
  var allTemplates = [];
  var allFolders = [];
  var selectedId = null;
  var activeFolderId = null;

  var $ = function(id) { return document.getElementById(id); };
  var toast = null;

  function showMsg(msg) {
    if (!toast) toast = $("toast");
    if (!toast) return;
    var d = document.createElement("div");
    d.className = "toast-item";
    d.textContent = msg;
    toast.appendChild(d);
    setTimeout(function() { d.remove(); }, 2500);
  }

  async function init() {
    toast = $("toast");
    $("refresh-btn").onclick = function() { loadTemplates(); loadFolders(); showMsg("Atualizado!"); };
    $("new-btn").onclick = newTemplate;
    $("new-folder-btn").onclick = newFolder;
    $("del-folder-btn").onclick = deleteFolder;
    $("editor-form").onsubmit = saveTemplate;
    $("delete-btn").onclick = deleteTemplate;
    $("search").oninput = function() { renderTemplates(); };
    $("download-ext-btn").onclick = downloadExtension;

    if (!sb) { showMsg("Cliente Supabase não disponível. Recarregue a extensão."); return; }

    try {
      // Restaura sessão do parent (app principal) se disponível
      try {
        var parentSb = window.parent._supabaseClient;
        if (parentSb) {
          var ps = await parentSb.auth.getSession();
          if (ps.data && ps.data.session) {
            await sb.auth.setSession({ access_token: ps.data.session.access_token, refresh_token: ps.data.session.refresh_token });
          }
        }
      } catch(e) {}

      var u = await sb.auth.getUser();
      if (!u.data || !u.data.user) { showMsg("Faça login no módulo principal"); return; }
      userId = u.data.user.id;
      await loadFolders();
      await loadTemplates();
      renderFolders();
      renderTemplates();
    } catch(e) { console.error(e); showMsg("Erro ao carregar dados"); }
  }

  async function downloadExtension() {
    // Download direto do arquivo estático pre-gerado
    var a = document.createElement("a");
    a.href = "../../minutario_ext.zip";
    a.download = "minutario-extensao.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showMsg("Download iniciado!");
  }

  async function loadFolders() {
    if (!sb || !userId) return;
    try {
      var r = await sb.from("minutario_folders").select("*").eq("user_id", userId);
      if (r.error) throw r.error;
      allFolders = (r.data || []).map(function(f) { return { id: f.id, name: f.name }; });
      renderFolders();
    } catch(e) { console.error("loadFolders:", e); }
  }

  async function loadTemplates() {
    if (!sb || !userId) return;
    try {
      var r = await sb.from("minutario_templates").select("*").eq("user_id", userId);
      if (r.error) throw r.error;
      allTemplates = (r.data || []).map(function(t) {
        return { id: t.id, name: t.name || "", shortcut: t.shortcut || "", folderId: t.folder_id || null, content: t.content || "" };
      });
      renderTemplates();
    } catch(e) { console.error("loadTemplates:", e); }
  }

  function renderFolders() {
    var el = $("folder-list"); if (!el) return;
    el.innerHTML = '<div class="folder-item' + (!activeFolderId ? ' active' : '') + '" data-id="">Todas</div>';
    allFolders.forEach(function(f) {
      var d = document.createElement("div");
      d.className = "folder-item" + (activeFolderId === f.id ? " active" : "");
      d.textContent = f.name;
      d.dataset.id = f.id;
      d.onclick = function() {
        activeFolderId = activeFolderId === f.id ? null : f.id;
        renderFolders();
        renderTemplates();
        $("del-folder-btn").style.display = activeFolderId ? "inline" : "none";
      };
      el.appendChild(d);
    });
    $("del-folder-btn").style.display = activeFolderId ? "inline" : "none";
    var sel = $("tpl-folder"); if (!sel) return;
    sel.innerHTML = '<option value="">Sem pasta</option>';
    allFolders.forEach(function(f) { var o = document.createElement("option"); o.value = f.id; o.textContent = f.name; sel.appendChild(o); });
  }

  function renderTemplates() {
    var q = ($("search").value || "").toLowerCase();
    var filtered = allTemplates.filter(function(t) {
      if (activeFolderId && t.folderId !== activeFolderId) return false;
      if (q && t.name.toLowerCase().indexOf(q) === -1 && t.shortcut.toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    var el = $("template-list"); if (!el) return;
    el.innerHTML = "";
    var empty = $("empty-state");
    if (filtered.length === 0) {
      el.style.display = "none";
      if (empty) empty.style.display = "flex";
      return;
    }
    el.style.display = "block";
    if (empty) empty.style.display = "none";
    filtered.forEach(function(t) {
      var d = document.createElement("div");
      d.className = "template-item" + (selectedId === t.id ? " selected" : "");
      d.innerHTML = '<div class="name">' + esc(t.name) + '</div><div class="shortcut">/' + esc(t.shortcut) + '</div>';
      d.onclick = function() { selectTemplate(t); };
      d.ondblclick = function() { copyTemplate(t); };
      el.appendChild(d);
    });
  }

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function selectTemplate(t) {
    selectedId = t.id;
    $("tpl-name").value = t.name || "";
    $("tpl-shortcut").value = t.shortcut || "";
    $("tpl-folder").value = t.folderId || "";
    $("tpl-content").value = t.content || "";
    $("delete-btn").style.display = "inline";
    renderTemplates();
  }

  function newTemplate() {
    selectedId = null;
    $("tpl-name").value = "";
    $("tpl-shortcut").value = "";
    $("tpl-folder").value = activeFolderId || "";
    $("tpl-content").value = "";
    $("delete-btn").style.display = "none";
    $("tpl-name").focus();
    renderTemplates();
  }

  async function saveTemplate(e) {
    e.preventDefault();
    var name = $("tpl-name").value.trim();
    var shortcut = $("tpl-shortcut").value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!name || !shortcut) { showMsg("Preencha nome e atalho"); return; }
    var folderId = $("tpl-folder").value || null;
    var content = $("tpl-content").value || "";
    var id = selectedId || crypto.randomUUID();
    var now = new Date().toISOString();
    var payload = { id: id, user_id: userId, folder_id: folderId, name: name, shortcut: shortcut, content: content, updated_at: now };
    if (!selectedId) payload.created_at = now;
    try {
      await sb.from("minutario_templates").upsert(payload, { onConflict: "id" });
      showMsg("Salvo!");
      selectedId = id;
      await loadTemplates();
      renderTemplates();
    } catch(e) { console.error(e); showMsg("Erro ao salvar"); }
  }

  async function deleteTemplate() {
    if (!selectedId || !confirm("Excluir este modelo?")) return;
    try {
      await sb.from("minutario_templates").delete().eq("id", selectedId).eq("user_id", userId);
      showMsg("Excluído!");
      selectedId = null;
      newTemplate();
      await loadTemplates();
      renderTemplates();
    } catch(e) { console.error(e); showMsg("Erro ao excluir"); }
  }

  async function copyTemplate(t) {
    var content = t.content || t.name || "";
    try {
      var htmlBlob = new Blob(["<html><body>" + content.replace(/\n/g, "<br>") + "</body></html>"], { type: "text/html" });
      var textBlob = new Blob([content], { type: "text/plain" });
      await navigator.clipboard.write([new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob })]);
      showMsg("Copiado!");
    } catch(e) {
      try { await navigator.clipboard.writeText(content); showMsg("Copiado!"); } catch(e2) { showMsg("Erro ao copiar"); }
    }
  }

  async function newFolder() {
    var name = prompt("Nome da pasta:");
    if (!name || !name.trim()) return;
    try {
      await sb.from("minutario_folders").insert({ id: crypto.randomUUID(), user_id: userId, name: name.trim(), order_idx: allFolders.length, created_at: new Date().toISOString() });
      await loadFolders();
      renderFolders();
      showMsg("Pasta criada!");
    } catch(e) { console.error(e); showMsg("Erro ao criar pasta"); }
  }

  async function deleteFolder() {
    if (!activeFolderId) return;
    var count = allTemplates.filter(function(t) { return t.folderId === activeFolderId; }).length;
    if (count > 0) { showMsg("Remova os modelos da pasta primeiro"); return; }
    if (!confirm("Excluir esta pasta?")) return;
    try {
      await sb.from("minutario_folders").delete().eq("id", activeFolderId).eq("user_id", userId);
      activeFolderId = null;
      await loadFolders();
      renderFolders();
      renderTemplates();
      showMsg("Pasta excluída!");
    } catch(e) { console.error(e); showMsg("Erro ao excluir pasta"); }
  }

  init();
})();
