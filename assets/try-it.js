// Small, local Try it Yourself editor. Preview code runs in an opaque-origin iframe.
const runnableBlocks = [...document.querySelectorAll('.code-block')].filter(block =>
  ['html', 'css', 'js', 'javascript'].includes(block.querySelector('.code-toolbar>span')?.textContent.trim().toLowerCase())
);
if (runnableBlocks.length) {
  const dialog = document.createElement('dialog');
  dialog.className = 'try-dialog';
  dialog.setAttribute('aria-labelledby', 'try-title');
  dialog.innerHTML = `
    <header class="try-header"><div><h2 id="try-title">Thử ngay<span>.</span></h2><p>Sửa code, nhấn Chạy, xem kết quả.</p></div><button type="button" class="try-close" aria-label="Đóng trình thử code">Đóng</button></header>
    <div class="try-toolbar"><div class="try-tabs" role="tablist" aria-label="Ngôn ngữ chỉnh sửa">
      <button type="button" id="tab-html" role="tab" aria-selected="true" aria-controls="panel-html" data-lang="html">HTML</button>
      <button type="button" id="tab-css" role="tab" aria-selected="false" aria-controls="panel-css" data-lang="css" tabindex="-1">CSS</button>
      <button type="button" id="tab-js" role="tab" aria-selected="false" aria-controls="panel-js" data-lang="js" tabindex="-1">JavaScript</button>
    </div><div class="try-actions"><button type="button" class="try-reset">Đặt lại</button><button type="button" class="try-run primary">Chạy code</button></div></div>
    <div class="try-workspace"><section class="try-editor" aria-label="Mã nguồn">
      <div id="panel-html" role="tabpanel" aria-labelledby="tab-html"><label class="sr-only" for="edit-html">Mã HTML</label><textarea id="edit-html" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off"></textarea></div>
      <div id="panel-css" role="tabpanel" aria-labelledby="tab-css" hidden><label class="sr-only" for="edit-css">Mã CSS</label><textarea id="edit-css" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off"></textarea></div>
      <div id="panel-js" role="tabpanel" aria-labelledby="tab-js" hidden><label class="sr-only" for="edit-js">Mã JavaScript</label><textarea id="edit-js" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off"></textarea></div>
    </section><section class="try-preview" aria-label="Kết quả chạy code"><div class="try-preview-label">Kết quả <span>Tự cập nhật khi nhấn Chạy</span></div><iframe title="Kết quả ví dụ của bạn" sandbox="allow-scripts" referrerpolicy="no-referrer"></iframe></section></div>
    <footer class="try-footer"><span>Ctrl/⌘ + Enter để chạy. Thay đổi chỉ giữ trong lần thử này.</span><span class="try-status" role="status" aria-live="polite"></span></footer><p class="try-error" role="alert" hidden></p>`;
  document.body.append(dialog);
  const editors = Object.fromEntries(['html','css','js'].map(lang => [lang, dialog.querySelector('#edit-' + lang)]));
  const tabs = [...dialog.querySelectorAll('[role=tab]')];
  const frame = dialog.querySelector('iframe');
  const status = dialog.querySelector('.try-status');
  const error = dialog.querySelector('.try-error');
  let initial = {};
  let opener;
  let runToken;
  function activate(lang, focus = false) {
    tabs.forEach(tab => {
      const selected = tab.dataset.lang === lang;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      dialog.querySelector('#panel-' + tab.dataset.lang).hidden = !selected;
      if (selected && focus) tab.focus();
    });
  }
  function run() {
    error.hidden = true;
    error.textContent = '';
    status.textContent = 'Đang chạy…';
    runToken = crypto.randomUUID();
    const doc = new DOMParser().parseFromString(editors.html.value, 'text/html');
    // All three editors are combined in memory; no file upload or server execution.
    doc.querySelectorAll('base, meta[http-equiv]').forEach(element => element.remove());
    const csp = doc.createElement('meta');
    csp.httpEquiv = 'Content-Security-Policy';
    csp.content = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: https:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'";
    doc.head.prepend(csp);
    if (!doc.documentElement.lang) doc.documentElement.lang = 'vi';
    if (!doc.querySelector('meta[charset]')) {
      const charset = doc.createElement('meta');charset.setAttribute('charset', 'utf-8');doc.head.prepend(charset);
    }
    const style = doc.createElement('style');style.textContent = editors.css.value;doc.head.append(style);
    const diagnostics = doc.createElement('script');
    diagnostics.textContent = `window.addEventListener('error',e=>parent.postMessage({type:'hit-try-error',token:${JSON.stringify(runToken)},message:e.message},'*'));window.addEventListener('unhandledrejection',e=>parent.postMessage({type:'hit-try-error',token:${JSON.stringify(runToken)},message:String(e.reason)},'*'));`;
    doc.head.insertBefore(diagnostics, csp.nextSibling);
    const script = doc.createElement('script');script.textContent = editors.js.value;doc.body.append(script);
    frame.srcdoc = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
  }
  frame.addEventListener('load', () => { if (dialog.open) status.textContent = error.hidden ? 'Đã chạy' : 'Kiểm tra lỗi bên dưới'; });
  window.addEventListener('message', event => {
    if (!dialog.open || event.source !== frame.contentWindow || event.data?.type !== 'hit-try-error' || event.data.token !== runToken) return;
    error.textContent = 'JavaScript: ' + String(event.data.message).slice(0, 500);
    error.hidden = false;
    status.textContent = 'Kiểm tra lỗi bên dưới';
  });
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset.lang));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();activate(tabs[next].dataset.lang, true);
    });
  });
  dialog.querySelector('.try-run').addEventListener('click', run);
  dialog.querySelector('.try-reset').addEventListener('click', () => {
    Object.entries(initial).forEach(([lang, value]) => { editors[lang].value = value; });
    run();
  });
  dialog.querySelector('.try-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault();run(); }
  });
  dialog.addEventListener('close', () => {
    frame.srcdoc = ''; // Stop timers and clear the previous preview when closing.
    document.body.classList.remove('try-open');
    opener?.focus({preventScroll:true});
  });
  runnableBlocks.forEach(block => {
    const button = document.createElement('button');
    button.type = 'button';button.className = 'try-button';button.textContent = 'Thử ngay';
    button.setAttribute('aria-haspopup', 'dialog');
    block.querySelector('.code-toolbar').append(button);
    button.addEventListener('click', () => {
      opener = button;
      const lang = block.querySelector('.code-toolbar>span').textContent.trim().toLowerCase();
      const code = block.querySelector('pre code').textContent;
      const sample = '<h1>Xin chào HTML</h1>\n<p>Thử đổi màu, nội dung hoặc kiểu chữ của đoạn văn này.</p>';
      initial = {html: lang === 'html' ? code : sample, css:'', js:''};
      if (lang === 'css') initial.css = code;
      if (lang === 'js' || lang === 'javascript') initial.js = code;
      if (lang === 'html' && /^\s*<(style|link)(\s|>)/i.test(code)) initial.html = code + '\n' + sample;
      if (lang === 'html' && /<link\b[^>]*href=["']style\.css["']/i.test(code)) initial.css = 'p {\n  color: green;\n}';
      if (lang === 'html' && /^\s*<script\b[^>]*src=["']script\.js["']/i.test(code)) {
        initial.html = '<button type="button" id="hello-button">Nhấn vào đây</button>\n<p id="message">Chưa có lời chào.</p>\n' + code;
        initial.js = 'document.getElementById("hello-button").addEventListener("click", function () {\n  document.getElementById("message").textContent = "Chào mừng bạn đến với lớp học web!";\n});';
      }
      Object.entries(initial).forEach(([key,value]) => { editors[key].value = value; });
      activate(lang === 'javascript' ? 'js' : lang);
      dialog.showModal();
      document.body.classList.add('try-open');
      run();
    });
  });
}