/* ================================================================
   assessment_admin.js  管理者ページ専用スクリプト
   ラジオ/チェックボックスへのスライダー付与は assessment.js が担当。
   このファイルは管理者固有の動作のみ担当する。
   ================================================================ */

/* ラベル列と人物列の li 高さを揃える */
function syncAdminDlHeights(dl) {
    const labelDd = dl.querySelector(':scope > dd.label-only');
    const personDds = dl.querySelectorAll(':scope > dd.person-eval');
    if (!labelDd || personDds.length === 0) return;
    const labelLis = Array.from(labelDd.querySelectorAll(':scope > ul > li'));
    if (labelLis.length === 0) return;
    personDds.forEach(personDd => {
        const personLis = Array.from(personDd.querySelectorAll(':scope > ul > li'));
        labelLis.forEach((li, i) => {
            if (personLis[i]) personLis[i].style.minHeight = li.offsetHeight + 'px';
        });
    });
}

function syncAllAdminDlHeights() {
    document.querySelectorAll('div.c-subsection dl').forEach(syncAdminDlHeights);
}

/* ══ 人物列共通：チェックボックス／ラジオ一体型スライダー ══ */
function initAdminSliders() {
    /* ドラッグ時に浮かぶツールチップ（body に1つだけ生成） */
    const tip = document.createElement('div');
    tip.className = 'a12-slider-tooltip';
    document.body.appendChild(tip);

    /* ─ ユーティリティ ─ */
    function getMode(slider) {
        const li  = slider.closest('li');
        const inp = li && li.querySelector('input[type="checkbox"], input[type="radio"]');
        return inp ? parseInt(inp.dataset.status ?? '1') : 1;
    }

    /* --ctrl-color CSS カスタムプロパティからスライダー色を取得 */
    function getCtrlColor(cb) {
        return getComputedStyle(cb).getPropertyValue('--ctrl-color').trim() || '#3d7cc9';
    }

    function updateTrack(cb, slider, wrap) {
        const active = cb.checked;
        if (!active) slider.value = slider.min;   // 未選択は最小値（左端）にリセット
        const pct   = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
        const color = getCtrlColor(cb);
        const empty = '#e4e4e4';
        slider.style.background = active
            ? `linear-gradient(to right, ${color} ${pct}%, ${empty} ${pct}%)`
            : empty;
        wrap.style.borderColor = active ? color : '#c0c0c0';
        wrap.classList.toggle('a12-inactive', !active);
    }

    function showTip(slider) {
        const label = typeof getSliderLabel === 'function'
            ? getSliderLabel(parseFloat(slider.value), getMode(slider))
            : slider.value;
        tip.textContent = label;
        tip.style.display = 'block';
        const rect = slider.getBoundingClientRect();
        const pct  = (slider.value - slider.min) / (slider.max - slider.min);
        tip.style.left = (rect.left + pct * rect.width) + 'px';
        tip.style.top  = (rect.top - 8) + 'px';
    }

    function hideTip() { tip.style.display = 'none'; }

    /* ラジオボタン変更時：同グループ全員のトラック色を更新 */
    function updateRadioSiblings(cb) {
        if (cb.type !== 'radio') return;
        document.querySelectorAll(`input[type="radio"][name="${CSS.escape(cb.name)}"]`)
            .forEach(r => {
                if (r !== cb && r._sliderWrap) {
                    const rs = r._sliderWrap.querySelector('.value-slider');
                    if (rs) updateTrack(r, rs, r._sliderWrap);
                }
            });
    }

    /* ─ スライダーへのバインド ─ */
    function bindSlider(cb, slider, wrap) {
        if (cb._adminSliderBound) return;   // 二重バインド防止
        cb._adminSliderBound = true;

        updateTrack(cb, slider, wrap);

        cb.addEventListener('change', () => {
            /* 未選択→選択時はスライダーを最大値（右端）にセット */
            if (cb.checked) slider.value = slider.max;
            updateTrack(cb, slider, wrap);
            updateRadioSiblings(cb);
        });

        slider.addEventListener('mousedown', () => {
            slider.classList.add('a12-dragging');
            showTip(slider);
        });
        slider.addEventListener('input', () => {
            updateTrack(cb, slider, wrap);
            showTip(slider);
        });
        ['mouseup', 'mouseleave'].forEach(ev =>
            slider.addEventListener(ev, () => {
                slider.classList.remove('a12-dragging');
                hideTip();
            })
        );
        slider.addEventListener('touchstart', () => {
            slider.classList.add('a12-dragging');
            showTip(slider);
        }, { passive: true });
        slider.addEventListener('touchend', () => {
            slider.classList.remove('a12-dragging');
            hideTip();
        });
    }

    function setupAll() {
        document.querySelectorAll('dd.person-eval li').forEach(li => {
            const cb = li.querySelector('input[type="checkbox"], input[type="radio"]');
            if (!cb) return;
            const wrap   = cb._sliderWrap;
            if (!wrap) return;
            const slider = wrap.querySelector('.value-slider');
            if (!slider) return;
            bindSlider(cb, slider, wrap);
        });
    }

    /*
     * assessment.js の DOMContentLoaded は async で fetch 後に initAllSliders() を呼ぶため、
     * こちらのコードより遅れてスライダーが DOM に追加される。
     * MutationObserver でスライダー生成を検知してからバインドする。
     */
    const container = document.querySelector('div.c-subsection') || document.body;
    const observer  = new MutationObserver(() => {
        if (container.querySelector('dd.person-eval .slider-wrap')) {
            observer.disconnect();
            setupAll();
        }
    });
    observer.observe(container, { childList: true, subtree: true });

    /* すでにスライダーが存在する場合は即時実行 */
    if (container.querySelector('dd.person-eval .slider-wrap')) {
        observer.disconnect();
        setupAll();
    }
}

/* ══ コメントモーダル（全人物列共通）══ */
function initA13CommentModal() {
    const triggers = document.querySelectorAll('.a13-comment-trigger');
    if (!triggers.length) return;

    /* ── モーダル（body に1つだけ生成） ── */
    const tmpl = document.getElementById('a13-modal-template');
    const modal = document.createElement('div');
    modal.className = 'a13-modal';
    modal.appendChild(tmpl.content.cloneNode(true));
    document.body.appendChild(modal);

    /* ── ホバーツールチップ（body に1つだけ生成） ── */
    const commentTip = document.createElement('div');
    commentTip.className = 'a13-comment-tooltip';
    document.body.appendChild(commentTip);

    const modalTa     = modal.querySelector('.a13-modal-textarea');
    let activeTrigger = null;
    let activeHidden  = null;

    /* 既存の hidden textarea に値があれば data-comment を初期化 */
    triggers.forEach(t => {
        const hidden = t.nextElementSibling;
        if (hidden instanceof HTMLTextAreaElement && hidden.value.trim()) {
            t.dataset.comment = hidden.value.trim();
            t.classList.add('has-comment');
        }
    });

    /* ── ツールチップ表示 ── */
    function showCommentTip(trigger) {
        /* hidden textarea から直接読み取る（非同期データ読み込み後も確実に反映） */
        const hidden = trigger.nextElementSibling;
        const txt = (hidden instanceof HTMLTextAreaElement ? hidden.value.trim() : '')
                   || (trigger.dataset.comment || '').trim();
        /* has-comment クラスを現在値と同期（非同期ロード対応） */
        trigger.classList.toggle('has-comment', txt.length > 0);
        if (!txt) return;

        commentTip.textContent = txt;
        commentTip.style.left = '-9999px';   // 測定中は画面外へ
        commentTip.style.top  = '-9999px';
        commentTip.style.display = 'block';

        const r  = trigger.getBoundingClientRect();
        const tw = commentTip.offsetWidth;
        const th = commentTip.offsetHeight;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let left = r.right + 8;
        if (left + tw > vw - 8) left = r.left - tw - 8;
        if (left < 8) left = 8;

        let top = r.top;
        if (top + th > vh - 8) top = vh - th - 8;
        if (top < 8) top = 8;

        commentTip.style.left = left + 'px';
        commentTip.style.top  = top  + 'px';
    }

    function hideCommentTip() { commentTip.style.display = 'none'; }

    /* ── モーダル開閉 ── */
    function open(trigger) {
        const hidden = trigger.nextElementSibling;
        activeTrigger = trigger;
        activeHidden  = hidden;
        modalTa.value = hidden ? hidden.value : '';
        hideCommentTip();
        modal.classList.add('a13-modal-open');
        modalTa.focus();
    }

    function close() {
        modal.classList.remove('a13-modal-open');
        activeTrigger = null;
        activeHidden  = null;
    }

    function save() {
        if (!activeTrigger || !activeHidden) return;
        const val = modalTa.value;
        activeHidden.value = val;
        /* data-comment にテキストを保存（ツールチップ用） */
        const trimmed = val.trim();
        if (trimmed) {
            activeTrigger.dataset.comment = trimmed;
        } else {
            delete activeTrigger.dataset.comment;
        }
        activeTrigger.classList.toggle('has-comment', trimmed.length > 0);
        close();
    }

    /* ── イベント登録 ── */
    triggers.forEach(t => {
        t.addEventListener('click',      () => open(t));
        t.addEventListener('mouseenter', () => showCommentTip(t));
        t.addEventListener('mouseleave', hideCommentTip);
    });

    modal.querySelector('.a13-modal-save').addEventListener('click', save);
    modal.querySelector('.a13-modal-cancel').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal.classList.contains('a13-modal-open')) close();
    });
}

/* ══ フリーズペイン：スクロールコンテナ設定 + sticky をインラインスタイルで強制適用 ══
   CSS の cascade/specificity/overflow 干渉を完全回避するため、
   position:sticky とその関連値をすべて element.style で直接書き込む。
   インラインスタイルは !important に次ぐ最高優先度を持つ。
   ══════════════════════════════════════════════════════════ */
function initFreezeScrollHandlers() {
    const scrollEl = document.querySelector('.page-wrapper .l-content-wrapper');
    if (!scrollEl) return;

    /* ── スクロールコンテナをインラインスタイルで強制設定 ── */
    scrollEl.style.overflow = 'auto';
    scrollEl.style.height   = '100vh';

    /* ── sticky を適用するルール一覧 ── */
    /* section.padding = 0 のため left の基点は section の左端（x=0）
       以前の left:20px / left:300px は section.padding=20px を想定した値。
       padding 除去後は left:0 / left:280px に変更する。 */
    const stickyRules = [
        /* 横固定：ページタイトルヘッダー */
        { sel: 'header', left: '0', z: 50 },
        /* 縦固定：人物名ヘッダー行 */
        { sel: '.c-tier__header.admin-col-header',
          top: '0', z: 30, shadow: '0 2px 6px rgba(0,0,0,0.3)' },
        /* コーナー：評価項目ヘッダー（上+左） */
        { sel: '.admin-col-header .admin-criteria-header',
          left: '0', z: 31 },
        /* 横固定：大項目（一般・指導 等） */
        { sel: '.c-tier__header:not(.admin-col-header)',
          left: '0', z: 20 },
        /* 横固定：分類説明行 */
        { sel: '.c-tier__body',
          left: '0', z: 15 },
        /* 横固定：中項目行 */
        { sel: '.c-section',
          left: '0', z: 15 },
        /* 横固定：小項目見出し */
        { sel: 'div.c-subsection > h1',
          left: '0', z: 15 },
        /* 横固定：評価項目列 col1 */
        { sel: 'div.c-subsection dl > dt',
          left: '0', z: 10, bg: '#ffffff' },
        /* 横固定：選択肢列 col2（dt幅=280px の直後） */
        { sel: 'div.c-subsection dl > dd.label-only',
          left: '280px', z: 9, bg: '#ffffff' },
        /* 横固定：選択肢ヘッダー col2 */
        { sel: '.admin-col-header .admin-options-header',
          left: '280px', z: 30 },
    ];

    stickyRules.forEach(({ sel, top, left, z, bg, shadow }) => {
        scrollEl.querySelectorAll(sel).forEach(el => {
            el.style.position = 'sticky';
            if (top    !== undefined) el.style.top       = top;
            if (left   !== undefined) el.style.left      = left;
            el.style.zIndex = String(z);
            if (bg     !== undefined) el.style.background = bg;
            if (shadow !== undefined) el.style.boxShadow  = shadow;
        });
    });

    /* ── バナー行幅制限：section の min-width(1135px) より狭くして
       position:sticky left が機能するようにする。
       min-width をインラインで 0 に上書きしないと CSS の min-width:1135px が
       JS の width より優先され、要素幅＝含有ブロック幅になって sticky が無効化される。 ── */
    function updateBannerWidths() {
        const w = scrollEl.clientWidth + 'px';
        [
            'header',
            '.c-tier__header:not(.admin-col-header)',
            '.c-tier__body',
            '.c-section',
            'div.c-subsection > h1',
        ].forEach(sel => {
            scrollEl.querySelectorAll(sel).forEach(el => {
                el.style.width = w;
                el.style.minWidth = '0';
            });
        });
    }
    updateBannerWidths();
    window.addEventListener('resize', updateBannerWidths);

    /* TOC 幅トランジション完了時に再計算 */
    const tocWrapper = document.getElementById('toc-wrapper');
    if (tocWrapper) {
        tocWrapper.addEventListener('transitionend', e => {
            if (e.propertyName === 'width') updateBannerWidths();
        });
    }

    /* ── 最上部・最下部ジャンプ ── */
    const topBtn = document.getElementById('scroll-to-top');
    const botBtn = document.getElementById('scroll-to-bottom');
    if (topBtn) topBtn.onclick = () => scrollEl.scrollTo({ top: 0, behavior: 'smooth' });
    if (botBtn) botBtn.onclick = () => scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: 'smooth' });

    /* ── 目次リンクをコンテナ内スクロールに差し替え ── */
    document.querySelectorAll('.toc-medium a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(a.getAttribute('href'));
            if (!target) return;
            const top = target.getBoundingClientRect().top
                      - scrollEl.getBoundingClientRect().top
                      + scrollEl.scrollTop;
            scrollEl.scrollTo({ top, behavior: 'smooth' });
        });
    });
}

/* ── 人物数に応じてグリッド列テンプレートと最小幅を動的に設定 ──
   CSS に固定の repeat(5, 87px) / min-width:1135px が埋め込まれていると
   人物が少ない場合も常に 1135px 幅が確保されてスクロールが発生する。
   実際の人物列数を数えてこれらの値を上書きする。 */
function initDynamicLayout() {
    const CRITERIA_W = 280, OPTIONS_W = 420, PERSON_W = 87;
    const personCount = document.querySelectorAll('.admin-col-header h2').length || 1;
    const contentWidth = CRITERIA_W + OPTIONS_W + personCount * PERSON_W;
    const gridCols = `${CRITERIA_W}px ${OPTIONS_W}px repeat(${personCount}, ${PERSON_W}px)`;

    document.querySelectorAll('.admin-col-header, div.c-subsection dl').forEach(el => {
        el.style.gridTemplateColumns = gridCols;
    });

    const sectionEl = document.querySelector('body.admin-page section');
    if (sectionEl) sectionEl.style.minWidth = contentWidth + 'px';

    document.querySelectorAll(
        'body.admin-page .c-tier, body.admin-page .c-tier__body, ' +
        'body.admin-page .c-section, body.admin-page .c-subsection'
    ).forEach(el => { el.style.minWidth = contentWidth + 'px'; });
}

/* ══ 階層型：親チェックボックス ON/OFF で隣接する子行をロック ══ */
function initB13HierarchyControls() {
    document.querySelectorAll('input.b13-parent-cb').forEach(parentCb => {
        const parentLi = parentCb.closest('li');
        if (!parentLi) return;

        function getChildLis() {
            const childLis = [];
            let sibling = parentLi.nextElementSibling;
            while (sibling) {
                if (sibling.querySelector('input.b13-parent-cb')) break;
                if (sibling.classList.contains('b13-child-row')) childLis.push(sibling);
                sibling = sibling.nextElementSibling;
            }
            return childLis;
        }

        function updateChildren() {
            const isChecked = parentCb.checked;
            getChildLis().forEach(li => {
                if (!isChecked) li.querySelectorAll('input').forEach(i => { i.checked = false; });
                li.classList.toggle('b13-child-locked', !isChecked);
            });
            const dl = parentCb.closest('dl');
            if (dl && typeof syncAdminDlHeights === 'function') syncAdminDlHeights(dl);
        }

        parentCb.addEventListener('change', updateChildren);
        updateChildren();
    });
}

/* [DEV] プロパティ切り替えトグル（後で削除） */
function initDevNoSliderToggle() {
    const toggle = document.getElementById('dev-no-slider-toggle');
    if (!toggle) return;
    toggle.addEventListener('change', () => {
        document.body.classList.toggle('no-slider-mode', toggle.checked);
        /* 行高さをラベル列と再同期（スライダー有無で内容高さが変わるため） */
        syncAllAdminDlHeights();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    /* html 要素に overflow:hidden を設定することで
       body の overflow が viewport に移譲される CSS 仕様を回避し、
       body 自体を clipping コンテナとして機能させる */
    document.documentElement.style.overflow = 'hidden';

    initDynamicLayout();
    syncAllAdminDlHeights();
    initAdminSliders();
    initA13CommentModal();
    initFreezeScrollHandlers();
    initB13HierarchyControls();
    initDevNoSliderToggle();

    const saveBtn = document.getElementById('admin-save');
    if (saveBtn && typeof Toast !== 'undefined') {
        saveBtn.addEventListener('click', () =>
            Toast.show('保存しました（サンプル）', 'result'));
    }
});
