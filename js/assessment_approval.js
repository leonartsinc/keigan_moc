/* ================================================================== */
/* スライダーラベル設定                                                 */
/* 1:ポジティブ / 0:ネガティブ の2モード。各 dl の data-status-mode で切替 */
/* ================================================================== */

const SLIDER_SCALES = {
    1: [
        { value: 0, label: 'たまにできている' },
        { value: 1, label: '半分できている' },
        { value: 2, label: 'ほとんどできている' },
        { value: 3, label: '完全にできている' },
    ],
    0: [
        { value: 3, label: '該当する' },
        { value: 2, label: 'ほとんど該当する' },
        { value: 1, label: '半分該当する' },
        { value: 0, label: '一部該当する' },
    ],
};
const SLIDER_SCALE = SLIDER_SCALES[1]; // min/max/step 算出用（ポジティブ基準）
const SLIDER_DEFAULT = 3;
/* ================================================================== */

/*
１．ＤＢの診断確定年月、昇給月を取得
２．年度、診断年月を算出
例１）診断確定年月（2024/03）、昇給月（4）月
    　年度：2024　診断年月：2025/03
例２）診断確定年月（2024/12）、昇給月（1）月
    　年度：2025　診断年月：2025/12
*/

const getFiscalYear = (fddate, prmonth) => {
    let yyyy = fddate.getFullYear();
    const mm = prmonth;
    if (mm === 1) {
        yyyy = yyyy + 1;
    }
    return yyyy;
};

const getDiagnosisMonth = (fddate, prmonth) => {
    const yyyy = fddate.getFullYear() + 1;
    let mm = prmonth;
    if (mm === 1) {
        mm = 11;
    } else {
        mm = mm - 2;
    }
    return new Date(yyyy, mm, 1);
};

/* ================================================================== */
/* Angular 等の API から返却された JSON を取得する（モック）            */
/* 実運用時はここを fetch('/api/assessment') 等に置き換える             */
/* ================================================================== */
async function fetchAssessmentData() {
    const res = await fetch('data/assessment_approval_data.json');
    if (!res.ok) throw new Error('assessment_approval_data.json の読み込みに失敗しました');
    return res.json();
}

/* JSON データを DOM に適用する */
function applyAssessmentData(data) {
    const { meta, items } = data;

    // --- ヘッダー年月 ---
    const fixedmonth     = new Date(meta.fixedmonth);
    const payrisemonth   = meta.payrisemonth;
    const fiscalyear     = getFiscalYear(fixedmonth, payrisemonth);
    const diagnosismonth = getDiagnosisMonth(fixedmonth, payrisemonth);

    if (document.getElementById('nendo')) {
        const baseYear  = diagnosismonth.getFullYear();
        const baseMonth = diagnosismonth.getMonth() + 1;
        document.getElementById('nendo').textContent     = fiscalyear;
        document.getElementById('kakuteiym').textContent = baseYear + '/' + baseMonth;
        document.querySelectorAll('[id$="ymago"]').forEach(el => {
            const n = parseInt(el.id);
            if (!isNaN(n)) el.textContent = (baseYear - n) + '/' + baseMonth;
        });
    }

    // --- 各小分類 dl に値をセット ---
    document.querySelectorAll('div.c-subsection dl').forEach(dl => {
        const dt = dl.querySelector(':scope > dt');
        if (!dt) return;
        const match = dt.textContent.trim().match(/^([A-Z][0-9]+)/);
        if (!match) return;
        const code = match[1];
        const itemData = items[code];
        if (!itemData) return;

        // selections: checked 状態とスライダー初期値を data 属性として保持
        itemData.selections.forEach(sel => {
            let inp;
            if (sel.type === 'checkbox') {
                inp = dl.querySelector(`input[type="checkbox"][name="${sel.name}"][value="${sel.value}"]`);
            } else {
                inp = dl.querySelector(`input[type="radio"][name="${sel.name}"][value="${sel.value}"]`);
            }
            if (!inp) return;
            inp.checked = sel.checked;
            inp.dataset.sliderInit = sel.sliderValue;
        });

        // コメント
        const ta = dl.querySelector('textarea');
        if (ta && itemData.comment !== undefined) ta.value = itemData.comment;

        // 過去年度値（data-past）
        const pastDds = dl.querySelectorAll(':scope > dd.past-val');
        itemData.pastValues.forEach((yearVals, yearIdx) => {
            const pastDd = pastDds[yearIdx];
            if (!pastDd) return;
            const lis = pastDd.querySelectorAll(':scope > ul > li[data-past]');
            yearVals.forEach((v, i) => {
                if (lis[i]) lis[i].dataset.past = v;
            });
        });

        // 本年評価値（data-past）
        if (itemData.mainYearValue) {
            const evalDd = dl.querySelector(':scope > dd.main-eval-val');
            if (evalDd) {
                const evalLis = evalDd.querySelectorAll(':scope > ul > li[data-past]');
                itemData.mainYearValue.forEach((v, i) => {
                    if (evalLis[i]) evalLis[i].dataset.past = v;
                });
            }
        }

        // 過去年度コメント（initPastComments で参照できるよう dd に保持）
        if (itemData.pastComments && itemData.pastComments.length > 0) {
            const pastDd0 = pastDds[0];
            const pastDd1 = pastDds[1];
            if (pastDd0) pastDd0.dataset.pastComment = itemData.pastComments[0] ?? '';
            if (pastDd1) pastDd1.dataset.pastComment = itemData.pastComments[1] ?? '';
        }
    });
}

// ラベル取得（mode: 1=ポジティブ, 0=ネガティブ、省略時はポジティブ）
function getSliderLabel(val, mode) {
    const m = (mode === 0 || mode === '0') ? 0 : 1;
    const scale = SLIDER_SCALES[m];
    const entry = scale.find(s => s.value === Math.round(val));
    return entry ? entry.label : String(Math.round(val));
}


// 過去年度列：1つの dl の past-val li の高さを対応する選択項目 li に合わせる
function syncDlHeights(dl) {
    const mainDd = dl.querySelector(':scope > dd:not(.past-val)');
    const pastDds = dl.querySelectorAll(':scope > dd.past-val');
    if (!mainDd || pastDds.length === 0) return;
    const mainLis = Array.from(mainDd.querySelectorAll(':scope > ul > li'));
    if (mainLis.length === 0) return;
    pastDds.forEach(pastDd => {
        const pastLis = Array.from(pastDd.querySelectorAll(':scope > ul > li'));
        mainLis.forEach((li, i) => {
            if (pastLis[i]) pastLis[i].style.height = li.offsetHeight + 'px';
        });
    });
}

function syncAllDlHeights() {
    document.querySelectorAll('div.c-subsection dl').forEach(syncDlHeights);
}

// 過去年度列: data-past 値 → 割合（%）表示
function initPastYearValues() {
    const slMin = SLIDER_SCALE[0].value;
    const slMax = SLIDER_SCALE[SLIDER_SCALE.length - 1].value;
    document.querySelectorAll('dd.past-val li[data-past], dd.main-eval-val li[data-past], dd.manager-eval-val li[data-past]').forEach(li => {
        const raw = li.dataset.past;
        if (raw === undefined || raw === '') return;
        const val = Math.round(parseFloat(raw));
        if (isNaN(val)) { li.textContent = ''; return; }
        li.textContent = ((val - slMin + 1) / (slMax - slMin + 1) * 100) + '%';
    });
}

function hideLoadingModal() {
    const modal = document.getElementById('loading-modal');
    if (!modal) return;
    modal.classList.add('loading-hidden');
    modal.addEventListener('transitionend', () => modal.remove(), { once: true });
    setTimeout(() => modal.remove(), 400);
}

// 人物のメイン年度評価列：ヘッダー挿入（各 c-tier__header の h3 の前）
// manager2-page（106_assessment_manager2.html）では、本人評価の左に上長評価列も追加する
function insertMainEvalHeaders() {
    const isManagerEvalPage = document.body.classList.contains('manager2-page');
    document.querySelectorAll('div.c-tier__header').forEach(hdr => {
        const h3 = hdr.querySelector(':scope > h3');
        if (!h3) return;
        if (isManagerEvalPage) {
            const managerH = document.createElement('h3');
            managerH.className = 'manager-eval-hd';
            managerH.textContent = '上長評価';
            hdr.insertBefore(managerH, h3);
        }
        const newH = document.createElement('h3');
        newH.className = 'main-eval-hd';
        newH.textContent = '本人評価';
        hdr.insertBefore(newH, h3);
    });
}

// 人物のメイン年度評価列：dd を最初の past-val の前に挿入
// manager2-page では、本人評価（main-eval-val）と同じ形の上長評価列（manager-eval-val）をさらに左に追加する
function insertMainEvalColumns() {
    const isManagerEvalPage = document.body.classList.contains('manager2-page');
    document.querySelectorAll('div.c-subsection dl').forEach(dl => {
        const firstPastDd = dl.querySelector(':scope > dd.past-val');
        if (!firstPastDd) return;

        const cloneEmptyValDd = (className) => {
            const dd = firstPastDd.cloneNode(true);
            dd.classList.remove('past-val', 'past-has-comment', 'past-no-comment');
            dd.classList.add(className);
            dd.removeAttribute('data-past-comment');
            dd.removeAttribute('data-tooltip');
            dd.querySelectorAll('li[data-past]').forEach(li => {
                li.dataset.past = '';
                li.textContent = '';
            });
            return dd;
        };

        if (isManagerEvalPage) {
            dl.insertBefore(cloneEmptyValDd('manager-eval-val'), firstPastDd);
        }
        dl.insertBefore(cloneEmptyValDd('main-eval-val'), firstPastDd);
    });
}

// 人物のメイン年度評価列：今年度の選択ラジオ値を data-past にセット
function populateMainEvalValues() {
    document.querySelectorAll('div.c-subsection dl').forEach(dl => {
        const mainDd = dl.querySelector(':scope > dd:not(.past-val):not(.main-eval-val):not(.manager-eval-val)');
        const evalDd = dl.querySelector(':scope > dd.main-eval-val');
        if (!mainDd || !evalDd) return;
        const mainLis = Array.from(mainDd.querySelectorAll(':scope > ul > li'));
        const evalLis = Array.from(evalDd.querySelectorAll(':scope > ul > li[data-past]'));
        mainLis.forEach((li, i) => {
            if (!evalLis[i]) return;
            const radio = li.querySelector('input[type="radio"]:checked');
            if (radio) evalLis[i].dataset.past = radio.value;
        });
    });
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', async () => {
    // 人物のメイン年度評価列を DOM に挿入
    insertMainEvalHeaders();
    insertMainEvalColumns();

    // JSON データ取得・DOM 反映（Angular 等から返却される想定）
    let dataLoaded = false;
    try {
        const data = await fetchAssessmentData();
        applyAssessmentData(data);
        dataLoaded = true;
    } catch (e) {
        console.warn('assessment_approval_data.json の適用をスキップ:', e.message);
    } finally {
        hideLoadingModal();
    }

    // 本年評価列：JSON に mainYearValue がない場合のみ DOM から補完
    if (!dataLoaded) populateMainEvalValues();

    // 過去年度列の value → ラベル変換（main-eval-val も含む）
    initPastYearValues();

    // 過去年度列のコメントツールチップ初期化
    initPastComments();

    // 全チェックボックス・ラジオボタンにスライダーを追加（parent-ctrl は除外）
    initAllSliders();

    // parent-ctrl：表示は常時、チェック時のみ子項目を選択可能にする
    document.querySelectorAll('.parent-ctrl[data-controls]').forEach(ctrl => {
        const childGroup = document.getElementById(ctrl.dataset.controls);
        if (!childGroup) return;
        const parentDl = ctrl.closest('dl');

        const syncChild = () => {
            const on = ctrl.checked;
            childGroup.classList.toggle('cg-disabled', !on);
            childGroup.querySelectorAll('input').forEach(inp => {
                inp.disabled = !on;
                if (!on) {
                    inp.checked = false;
                    if (inp._sliderWrap) inp._sliderWrap.style.display = 'none';
                }
            });
            if (parentDl) syncDlHeights(parentDl);
        };

        ctrl.addEventListener('change', syncChild);

        // ラジオグループ内の他ボタン変化時にも子グループを再評価
        if (ctrl.type === 'radio' && ctrl.name) {
            document.querySelectorAll(`input[type="radio"][name="${ctrl.name}"]`).forEach(r => {
                if (r !== ctrl) r.addEventListener('change', syncChild);
            });
        }

        syncChild(); // 初期状態を適用
    });

    // 過去年度列の高さを選択項目に合わせる
    syncAllDlHeights();

    // コンテンツ側アコーディオン
    initContentAccordion();

    // 目次大分類アコーディオン
    initTocAccordion();

    // 目次サイドバー開閉
    initTocToggle();

    // コンテンツ大分類アコーディオン
    initTierAccordion();

    // ページヘッダー／メイン評価列見出し行を縦スクロール時も上部に固定
    initStickyPageHeader();

    // 目次（中分類）リンクをコンテナ内スクロールに差し替え
    initTocLinkScroll();

    // 最上部ジャンプ
    document.getElementById('scroll-to-top').addEventListener('click', () => {
        document.querySelector('.page-wrapper .l-content-wrapper').scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 最下部ジャンプ
    document.getElementById('scroll-to-bottom').addEventListener('click', () => {
        const scrollEl = document.querySelector('.page-wrapper .l-content-wrapper');
        scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: 'smooth' });
    });

    // サンプル：キャンセル → 警告
    ['cancel'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', () =>
            Toast.show('操作をキャンセルしました。入力内容は保存されていません。', 'warning'));
    });

    // サンプル：診断する → エラー
    ['send', 'toc-send'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', () =>
            Toast.show('入力内容にエラーがあります。必須項目を確認してください。', 'error'));
    });

    // サンプル：一時保存 → 結果
    ['temporary', 'toc-temporary'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', () =>
            Toast.show('一時保存が完了しました。', 'result'));
    });
});

function initTierAccordion() {
    const tierData = [];
    document.querySelectorAll('.c-tier[id^="tier-"]').forEach(tier => {
        const titleHd = Array.from(tier.querySelectorAll('.c-tier__header'))
            .find(hd => hd.querySelector('h1'));
        if (!titleHd) return;

        const siblings = [];
        let sib = tier.nextElementSibling;
        while (sib && !sib.classList.contains('c-tier') && !sib.classList.contains('c-page-footer')) {
            siblings.push(sib);
            sib = sib.nextElementSibling;
        }

        tier.classList.add('tier-open');
        titleHd.classList.add('tier-acc-trigger');
        tierData.push({ tier, siblings });

        titleHd.addEventListener('click', () => {
            const isOpen = tier.classList.contains('tier-open');
            tier.classList.toggle('tier-open', !isOpen);
            if (isOpen) {
                siblings.forEach(s => s.style.display = 'none');
            } else {
                let parentCollapsed = false;
                siblings.forEach(s => {
                    if (s.classList.contains('c-section')) {
                        parentCollapsed = s.classList.contains('acc-collapsed');
                        s.style.display = '';
                    } else if (s.classList.contains('c-subsection')) {
                        s.style.display = parentCollapsed ? 'none' : '';
                    } else {
                        s.style.display = '';
                    }
                });
                syncAllDlHeights();
            }
        });
    });

    document.getElementById('content-expand-all').addEventListener('click', () => {
        tierData.forEach(({ tier, siblings }) => {
            tier.classList.add('tier-open');
            siblings.forEach(s => s.style.display = '');
        });
        syncAllDlHeights();
    });

    document.getElementById('content-collapse-all').addEventListener('click', () => {
        tierData.forEach(({ tier, siblings }) => {
            tier.classList.remove('tier-open');
            siblings.forEach(s => s.style.display = 'none');
        });
    });
}

function initTocAccordion() {
    document.querySelectorAll('.toc-large').forEach(li => {
        const anchor = li.querySelector(':scope > a');
        if (!anchor) return;
        anchor.addEventListener('click', e => {
            e.preventDefault();
            li.classList.toggle('toc-open');
        });
    });
}

function initTocToggle() {
    const btn = document.getElementById('toc-toggle');
    const wrapper = document.getElementById('toc-wrapper');
    if (!btn || !wrapper) return;
    btn.addEventListener('click', () => {
        wrapper.classList.toggle('toc-collapsed');
    });
}

// ページヘッダー（タイトル行）とメイン評価列見出し行（本人評価／上長評価等の列名）を、
// 縦スクロール時も常に画面上部へ固定表示する。
// .l-content-wrapper が実際のスクロールコンテナ（css 側で overflow:auto; height:100vh）。
//
// position:sticky の可動範囲は「直近のブロック祖先（containing block）」の高さに
// 制限される。メイン評価列見出し行は本来 .c-tier（見出し2行分・高さ約50px）の
// 子要素だが、.c-tier__body/.c-section/.c-subsection 等の実コンテンツは .c-tier の
// 兄弟要素であり子要素ではないため、.c-tier を containing block のままにすると
// 数十px スクロールしただけで固定が外れてしまう。
// そのため section 直下（.c-tier の直前）へ移動し、containing block を
// section （全コンテンツの高さ）に広げる。section の padding は .c-tier 等と
// 同一なので、幅計算（min-width:calc(100% + 140px)）の基準は変わらず揃う。
function initStickyPageHeader() {
    const scrollEl = document.querySelector('.page-wrapper .l-content-wrapper');
    const pageHeader = scrollEl && scrollEl.querySelector(':scope > header');
    const section = scrollEl && scrollEl.querySelector(':scope > section');
    const mainTierHeader = section && section.querySelector(':scope > .c-tier:first-of-type > .c-tier__header:first-child');
    if (!scrollEl || !pageHeader || !section || !mainTierHeader) return;

    section.insertBefore(mainTierHeader, section.firstElementChild);
    mainTierHeader.classList.add('main-tier-header--sticky');

    pageHeader.style.position = 'sticky';
    pageHeader.style.top = '0';
    pageHeader.style.zIndex = '31';

    const applyTierHeaderOffset = () => {
        mainTierHeader.style.position = 'sticky';
        mainTierHeader.style.top = pageHeader.getBoundingClientRect().height + 'px';
        mainTierHeader.style.zIndex = '30';
    };
    applyTierHeaderOffset();
    window.addEventListener('resize', applyTierHeaderOffset);
    window.addEventListener('load', applyTierHeaderOffset);
}

// 目次（中分類）リンクのクリックをコンテナ内スクロールに差し替える。
// .l-content-wrapper が実スクロールコンテナのため、ネイティブのアンカージャンプ
// （document 側の scrollIntoView）はもう機能しない。
function initTocLinkScroll() {
    const scrollEl = document.querySelector('.page-wrapper .l-content-wrapper');
    if (!scrollEl) return;
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

function initContentAccordion() {
    const allTargets = new Map();

    document.querySelectorAll('.c-section').forEach(sub => {
        const h1 = sub.querySelector('h1');
        if (!h1) return;

        const targets = [];
        let sib = sub.nextElementSibling;
        while (sib && sib.classList.contains('c-subsection')) {
            targets.push(sib);
            sib = sib.nextElementSibling;
        }
        if (targets.length === 0) return;

        allTargets.set(sub, targets);
        h1.classList.add('acc-trigger');
        h1.addEventListener('click', () => {
            const closing = !sub.classList.contains('acc-collapsed');
            sub.classList.toggle('acc-collapsed', closing);
            targets.forEach(t => {
                t.style.display = closing ? 'none' : '';
                if (!closing) t.querySelectorAll('dl').forEach(syncDlHeights);
            });
        });
    });

    document.getElementById('content-expand-all').addEventListener('click', () => {
        allTargets.forEach((targets, sub) => {
            sub.classList.remove('acc-collapsed');
            targets.forEach(t => { t.style.display = ''; });
        });
        syncAllDlHeights();
    });

    document.getElementById('content-collapse-all').addEventListener('click', () => {
        allTargets.forEach((targets, sub) => {
            sub.classList.add('acc-collapsed');
            targets.forEach(t => { t.style.display = 'none'; });
        });
    });
}

// 過去年度列へのコメントツールチップ初期化
// コメントは applyAssessmentData() で dd.dataset.pastComment にセット済み
function initPastComments() {
    document.querySelectorAll('div.c-subsection dl').forEach(dl => {
        dl.querySelectorAll(':scope > dd.past-val').forEach(dd => {
            const text = dd.dataset.pastComment ?? '';
            if (text) {
                dd.dataset.tooltip = text;
                dd.classList.add('past-has-comment');
            } else {
                dd.classList.add('past-no-comment');
            }
        });
    });

    initPastCommentTooltip();
}

function initPastCommentTooltip() {
    const tip = document.createElement('div');
    tip.className = 'past-comment-tooltip';
    document.body.appendChild(tip);

    const GAP = 6;

    function show(dd) {
        tip.textContent = dd.dataset.tooltip;
        tip.style.display = 'block';
        place(dd);
    }

    function place(dd) {
        const r   = dd.getBoundingClientRect();
        const tw  = tip.offsetWidth;
        const th  = tip.offsetHeight;
        const vw  = window.innerWidth;
        const vh  = window.innerHeight;

        // 上に出す（収まらなければ下）
        let top = r.top - th - GAP;
        if (top < GAP) top = r.bottom + GAP;

        // 水平：要素中央揃えし、左右をビューポート内にクランプ
        let left = r.left + r.width / 2 - tw / 2;
        left = Math.max(GAP, Math.min(vw - tw - GAP, left));

        tip.style.top  = top  + 'px';
        tip.style.left = left + 'px';
    }

    document.querySelectorAll('dd.past-val[data-tooltip]').forEach(dd => {
        dd.addEventListener('mouseenter', () => show(dd));
        dd.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
    });
}

// 全チェックボックス・ラジオボタンへのスライダー動的生成
function initAllSliders() {
    const slMin  = SLIDER_SCALE[0].value;
    const slMax  = SLIDER_SCALE[SLIDER_SCALE.length - 1].value;
    const slStep = SLIDER_SCALE.length > 1
        ? SLIDER_SCALE[1].value - SLIDER_SCALE[0].value
        : 1;
    let idx = 0;

    document.querySelectorAll(
        'input[type="checkbox"]:not([disabled]):not(.parent-ctrl), input[type="radio"]:not([disabled]):not(.parent-ctrl)'
    ).forEach(input => {
        const value = parseFloat(input.value);
        // value が 0 または空・非数は対象外
        if (isNaN(value) || value === 0) return;

        const wrapId = `as_wrap_${idx}`;
        const slId   = `as_sl_${idx}`;
        const valId  = `as_val_${idx}`;
        idx++;

        // スライダーラップを生成
        const wrap = document.createElement('span');
        wrap.id        = wrapId;
        wrap.className = 'slider-wrap';
        wrap.style.display = 'none';

        const sl = document.createElement('input');
        sl.type      = 'range';
        sl.id        = slId;
        sl.className = 'value-slider';
        sl.min       = slMin;
        sl.max       = slMax;
        sl.step      = slStep;
        const initVal = input.dataset.sliderInit !== undefined
            ? parseFloat(input.dataset.sliderInit)
            : SLIDER_DEFAULT;
        sl.value = initVal;

        const inputStatus = parseInt(input.dataset.status ?? '1');
        if (!input.dataset.status) input.dataset.status = '1';

        const valSpan = document.createElement('span');
        valSpan.id        = valId;
        valSpan.className = 'slider-val';
        valSpan.textContent = getSliderLabel(initVal, inputStatus);

        sl.addEventListener('input', () => {
            valSpan.textContent = getSliderLabel(parseFloat(sl.value), inputStatus);
        });

        wrap.appendChild(sl);
        wrap.appendChild(valSpan);

        // 親 <li> を flex コンテナに変換
        const li = input.closest('li');
        if (li) li.classList.add('slider-item');

        // label 内か否かでスライダーの挿入位置を決定
        const label = input.closest('label');
        if (label) {
            label.after(wrap);
        } else {
            input.after(wrap);
        }

        const parentDl = input.closest('dl');

        if (input.type === 'checkbox') {
            // チェックボックス：ON/OFF でスライダー表示切替
            input._sliderWrap = wrap;
            input.addEventListener('change', () => {
                wrap.style.display = input.checked ? 'flex' : 'none';
                if (parentDl) syncDlHeights(parentDl);
            });
            if (input.checked) wrap.style.display = 'flex';

        } else {
            // ラジオボタン：選択時に同グループの他スライダーを隠して自身を表示
            input._sliderWrap = wrap;
            input.addEventListener('change', () => {
                document.querySelectorAll(`input[type="radio"][name="${input.name}"]:not([disabled])`)
                    .forEach(r => { if (r._sliderWrap) r._sliderWrap.style.display = 'none'; });
                wrap.style.display = 'flex';
                if (parentDl) syncDlHeights(parentDl);
            });
            if (input.checked) wrap.style.display = 'flex';
        }
    });
}

/* ================================================================== */
/* トースト通知システム                                                  */
/* ================================================================== */
const Toast = (() => {
    const MAX   = 10;
    const DELAY = 5000;
    const META  = {
        error:   { label: 'ERROR',   icon: '✕' },
        warning: { label: 'WARNING', icon: '⚠' },
        result:  { label: 'RESULT',  icon: '✓' },
    };

    function getContainer() {
        let c = document.getElementById('toast-container');
        if (!c) {
            c = document.createElement('div');
            c.id = 'toast-container';
            document.body.appendChild(c);
        }
        return c;
    }

    function dismiss(el) {
        el.classList.add('toast-out');
        el.addEventListener('transitionend', () => el.remove(), { once: true });
        // transitionend が発火しない場合のフォールバック
        setTimeout(() => el.remove(), 400);
    }

    function show(message, type = 'result') {
        const c = getContainer();
        const existing = c.querySelectorAll('.toast');
        if (existing.length >= MAX) dismiss(existing[0]);

        const m = META[type] ?? META.result;

        const icon = document.createElement('span');
        icon.className = 'toast-icon';
        icon.textContent = m.icon;

        const label = document.createElement('div');
        label.className = 'toast-label';
        label.textContent = m.label;

        const msg = document.createElement('div');
        msg.className = 'toast-msg';
        msg.textContent = message;

        const body = document.createElement('span');
        body.className = 'toast-body';
        body.append(label, msg);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.setAttribute('aria-label', '閉じる');
        closeBtn.textContent = '×';

        const el = document.createElement('div');
        el.className = `toast toast-${type}`;
        el.append(icon, body, closeBtn);

        let timer = setTimeout(() => dismiss(el), DELAY);
        el.addEventListener('mouseenter', () => clearTimeout(timer));
        el.addEventListener('mouseleave', () => { timer = setTimeout(() => dismiss(el), DELAY); });
        closeBtn.addEventListener('click', () => {
            clearTimeout(timer);
            dismiss(el);
        });

        c.appendChild(el);
    }

    return { show };
})();