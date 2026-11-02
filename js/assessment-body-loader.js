// Component: AssessmentBodyLoader
// 複数ページ（102/104/106など）で完全に共通のアセスメント設問マークアップを
// partials/配下の共有HTMLから読み込み、ページ固有の見出し文言のみ置換して挿入する。
// 同期XHR + document.write により、静的HTMLをその場に直接書いていた場合と
// 同じタイミング・同じDOM構造を再現する。
function includeAssessmentBody(url, replacements) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, false);
  xhr.send(null);

  var html = xhr.responseText;
  for (var token in replacements) {
    html = html.split(token).join(replacements[token]);
  }

  document.write(html);
}
