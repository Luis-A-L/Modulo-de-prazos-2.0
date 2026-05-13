document.addEventListener("DOMContentLoaded", function () {
  var statusEl = document.getElementById("sync-status");
  var userEmailEl = document.getElementById("user-email");
  var recentList = document.getElementById("recent-list");
  var statusIndicator = document.getElementById("status-indicator");
  
  var loginSection = document.getElementById("login-section");
  var dashboardSection = document.getElementById("dashboard-section");
  var loginForm = document.getElementById("login-form");
  var loginError = document.getElementById("login-error");
  var loginSubmit = document.getElementById("login-submit");
  var logoutBtn = document.getElementById("logout-btn");
  var logoutLinkBtn = document.getElementById("logout-link-btn");
  var togglePasswordBtn = document.getElementById("toggle-password");
  var saveLoginCheck = document.getElementById("save-login-check");

  var sbClient = window.supabase && window.MinutarioConfig 
    ? window.supabase.createClient(window.MinutarioConfig.SUPABASE_URL, window.MinutarioConfig.SUPABASE_ANON_KEY)
    : null;

  function setStatus(state) {
    if (!statusIndicator) return;
    if (state === "offline") {
      statusIndicator.style.background = "var(--status-offline)";
    } else {
      statusIndicator.style.background = "var(--status-ready)";
    }
  }

  function showDashboard() {
    if (loginSection) loginSection.style.display = "none";
    if (dashboardSection) dashboardSection.style.display = "flex";
    loadRecent();
  }

  function showLogin() {
    if (loginSection) loginSection.style.display = "flex";
    if (dashboardSection) dashboardSection.style.display = "none";
    setStatus("offline");
  }

  // Restaura email salvo ao mostrar login
  function restoreSavedEmail() {
    chrome.storage.local.get("minutario_saved_email", function (result) {
      var emailInput = document.getElementById("login-email");
      if (emailInput && result.minutario_saved_email) {
        emailInput.value = result.minutario_saved_email;
        if (saveLoginCheck) saveLoginCheck.checked = true;
      }
    });
  }

  // Toggle show/hide password
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener("click", function () {
      var pwdInput = document.getElementById("login-password");
      if (!pwdInput) return;
      var isPassword = pwdInput.type === "password";
      pwdInput.type = isPassword ? "text" : "password";
      togglePasswordBtn.textContent = isPassword ? "🙈" : "👁";
      togglePasswordBtn.setAttribute("aria-label", isPassword ? "Ocultar senha" : "Mostrar senha");
    });
  }

  async function checkAuth() {
    if (!sbClient) {
      restoreSavedEmail();
      return showLogin();
    }
    
    var { data } = await sbClient.auth.getSession();
    if (data && data.session) {
      if (userEmailEl) userEmailEl.textContent = data.session.user.email;
      setStatus("ready");
      showDashboard();
      return;
    }
    
    await restoreSessionFromPage();
  }

  checkAuth();

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (!sbClient) return;

      var email = document.getElementById("login-email").value.trim();
      var password = document.getElementById("login-password").value;

      if (email && email.indexOf("@") === -1) {
        email += "@tjpr.jus.br";
      }

      loginSubmit.disabled = true;
      loginSubmit.textContent = "Entrando...";
      loginError.style.display = "none";

      var { data, error } = await sbClient.auth.signInWithPassword({
        email: email,
        password: password,
      });

      loginSubmit.disabled = false;
      loginSubmit.textContent = "Entrar";

      if (error) {
        loginError.textContent = "Credenciais inválidas ou erro de conexão.";
        loginError.style.display = "block";
      } else if (data && data.session) {
        var storageData = {
          minutario_access_token: data.session.access_token,
          minutario_refresh_token: data.session.refresh_token,
          minutario_user_id: data.user.id
        };

        // Salva email se checkbox marcado
        if (saveLoginCheck && saveLoginCheck.checked) {
          storageData.minutario_saved_email = email;
        } else {
          storageData.minutario_saved_email = null;
        }

        await chrome.storage.local.set(storageData);
        await chrome.runtime.sendMessage({
          type: "UPDATE_SESSION",
          payload: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user_id: data.user.id
          }
        });

        if (userEmailEl) userEmailEl.textContent = data.user.email;
        setStatus("ready");
        showDashboard();
        
        statusEl.textContent = "Sincronizando...";
        try {
          var resp = await chrome.runtime.sendMessage({ type: "FORCE_SYNC" });
          if (resp.ok) statusEl.textContent = "Atualizado!";
        } catch (err) {}
      }
    });
  }

  function handleLogout() {
    if (sbClient) sbClient.auth.signOut();
    chrome.storage.local.remove([
      "minutario_access_token",
      "minutario_refresh_token",
      "minutario_user_id"
    ]);
    document.getElementById("login-password").value = "";
    restoreSavedEmail();
    showLogin();
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  if (logoutLinkBtn) {
    logoutLinkBtn.addEventListener("click", handleLogout);
  }

  document.getElementById("open-quick-access").addEventListener("click", function () {
    chrome.runtime.sendMessage({ type: "OPEN_QUICK_ACCESS", payload: { focusExisting: true } });
    window.close();
  });

  document.getElementById("force-sync").addEventListener("click", async function () {
    statusEl.textContent = "Sincronizando...";
    await restoreSessionFromPage();
    try {
      var resp = await chrome.runtime.sendMessage({ type: "FORCE_SYNC" });
      if (resp.ok && resp.data && resp.data.updated) {
        statusEl.textContent = "Atualizado (" + (resp.data.count || 0) + ")";
      } else if (resp.ok) {
        statusEl.textContent = resp.data && resp.data.error ? resp.data.error : "Sem alterações";
      } else {
        statusEl.textContent = "Erro: " + (resp.error || "desconhecido");
      }
    } catch (e) {
      statusEl.textContent = "Erro na sincronização";
    }
  });

  async function restoreSessionFromPage() {
    try {
      var tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || !tabs[0] || !tabs[0].id) {
        restoreSavedEmail();
        return showLogin();
      }
      var resp = await chrome.tabs.sendMessage(tabs[0].id, { type: "GET_SUPABASE_TOKEN" });
      if (resp && resp.ok && resp.access_token) {
        await chrome.storage.local.set({
          minutario_access_token: resp.access_token,
          minutario_refresh_token: resp.refresh_token
        });
        if (sbClient) {
          await sbClient.auth.setSession({
            access_token: resp.access_token,
            refresh_token: resp.refresh_token
          });
        }
        if (userEmailEl) userEmailEl.textContent = resp.email || "Conectado";
        if (statusEl) statusEl.textContent = "Sessão restaurada";
        setStatus("ready");
        showDashboard();
        return;
      }
    } catch (e) { }
    
    restoreSavedEmail();
    var { data } = await sbClient.auth.getSession();
    if (!data || !data.session) {
      showLogin();
    }
  }

  async function loadRecent() {
    if (!recentList) return;
    try {
      var resp = await chrome.runtime.sendMessage({ type: "GET_TEMPLATES", payload: {} });
      if (resp && resp.ok && Array.isArray(resp.data)) {
        var items = resp.data.slice(0, 5);
        recentList.innerHTML = "";
        if (items.length === 0) {
          recentList.innerHTML = '<p class="empty-state">Nenhum modelo ainda</p>';
          return;
        }
        items.forEach(function(t) {
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "recent-item";
          btn.innerHTML = '<span class="recent-name">' + (t.name || "Sem nome") + '</span><span class="recent-shortcut">/' + (t.shortcut || "") + '</span>';
          btn.addEventListener("click", function() { copyTemplate(t, btn); });
          recentList.appendChild(btn);
        });
      }
    } catch(e) {}
  }

  async function copyTemplate(template, btn) {
    var content = template.content || template.name || "";
    try {
      var htmlBlob = new Blob([content], { type: "text/html" });
      var textBlob = new Blob([content], { type: "text/plain" });
      await navigator.clipboard.write([new ClipboardItem({ "text/html": htmlBlob, "text/plain": textBlob })]);
      btn.textContent = "Copiado!";
      setTimeout(function() { loadRecent(); }, 1500);
    } catch(e) {
      try { await navigator.clipboard.writeText(content); btn.textContent = "Copiado!"; } catch(e2) {}
    }
  }
});
