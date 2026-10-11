(() => {
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
  }
  if (standalone || document.getElementById('pwaInstallButton')) return;

  let installPrompt = null;
  const button = document.createElement('button');
  button.id = 'pwaInstallButton';
  button.type = 'button';
  button.textContent = '앱 설치';
  button.setAttribute('aria-label', '아디다스 스토어 앱 설치');
  button.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:90;padding:12px 18px;border:0;border-radius:999px;background:#111;color:#fff;font:700 13px/1 Arial,sans-serif;box-shadow:0 4px 18px #0003;cursor:pointer';
  document.body.append(button);

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
  });
  window.addEventListener('appinstalled', () => {
    button.remove();
    installPrompt = null;
  });
  button.addEventListener('click', async () => {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      return;
    }
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    alert(isIOS
      ? 'Safari의 공유 버튼을 누른 다음 “홈 화면에 추가”를 선택해 주세요.'
      : '브라우저 메뉴에서 “앱 설치” 또는 “홈 화면에 추가”를 선택해 주세요. 설치 메뉴가 보이지 않으면 localhost 주소로 접속했는지 확인해 주세요.');
  });
})();
