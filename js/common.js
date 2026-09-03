function mountHeader(title) {
  const placeholder = document.getElementById('app-header');
  if (!placeholder) return;
  placeholder.outerHTML = `
    <!-- Component: Header -->
    <header class="hidden md:flex fixed z-40
                    top-0 left-0 right-0
                    h-14
                    py-2 px-3
                    backdrop-blur-md
                    bg-white/80
                    justify-between items-center">

      <!-- 左エリア -->
      <div class="flex items-center gap-3">

        <!-- ロゴ -->
        <div id="sidebarLogo"
            class="pl-16 pr-2 py-2 flex items-center gap-3">
          <div class="flex items-center pr-4 shrink-0">
            <a href="index.html">
              <img src="img/LOGO01.png"
                  alt="ロゴ"
                  class="h-9 object-contain">
            </a>
          </div>
        </div>

      </div>

      <!-- 右エリア -->
      <div class="flex items-center gap-4 relative">

        <!-- ヘルプ -->
        <button
          class="w-8 h-8 flex items-center justify-center rounded-full
                border hover:bg-orange-50
                hover:text-orange-400 transition"
          title="ヘルプ">
          <span class="text-sm font-semibold">?</span>
        </button>

        <!-- ユーザーアイコン -->
        <button onclick="toggleUserMenu(event)"
                class="w-8 h-8 rounded-full overflow-hidden hover:ring-1 hover:ring-orange-300 transition"
                title="アカウント">
          <img src="img/丸アイコン_丸尾2.png"
              class="w-full h-full object-cover"
              alt="ユーザー画像">
        </button>

        <!-- ユーザーメニュー -->
        <div id="userMenu"
            onclick="event.stopPropagation()"
            class="p-2 hidden absolute right-0 top-11 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 transition duration-200">

          <!-- 上部プロフィール -->
          <div class="p-4 bg-gray-100">
            <div class="flex items-center gap-3">
              <div class="w-20 h-20 rounded-full overflow-hidden">
                <img src="img/丸アイコン_丸尾2.png"
                    class="w-full h-full object-cover">
              </div>
              <div>
                <p class="font-bold text-sm">丸尾 幹</p>
                <p class="text-xs text-gray-500">株式会社レオンアーツ</p>
                <p class="text-xs text-blue-500">k-maruo@leonarts.co.jp</p>
                <p class="text-xs text-gray-500">一般ユーザ</p>
              </div>
            </div>
          </div>

          <div class="p-4 border-b border-gray-100 ">
            <div class="flex items-center gap-3">
              <div>
                <p class="font-bold text-sm">問い合わせ番号</p>
              </div>
            </div>
            <div class="pt-2 flex items-center justify-center gap-3">
              <div>
                <p class="p-3 rounded-xl text-lg border justify-center border-gray-300 text-gray-500">S133185-65127</p>
              </div>
            </div>
          </div>

          <!-- メニュー -->
          <div class="py-0 text-xs">
            <a href="#"
              class="flex items-center px-4 py-3 hover:bg-orange-50 transition">
              パスワード変更
            </a>
            <div class="border-t border-gray-100"></div>
            <a href="020_login.html"
              class="flex items-center px-4 py-3 text-red-500 hover:bg-red-50 transition">
              ログアウト
            </a>
          </div>
        </div>

      </div>

    </header>
    <!-- /Component: Header -->

    <!-- Component: MobileHeader -->
    <header class="md:hidden shadow p-4 flex justify-between items-center bg-white">
      <button onclick="toggleSidebar()" class="text-xl">☰</button>
      <h1 class="font-bold">${title}</h1>
      <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
    </header>
    <!-- /Component: MobileHeader -->

    <!-- Component: Sidebar（アイコンメニュー／デフォルト閉じた状態） -->
    <aside id="sidebar"
      class="fixed z-50 top-0 left-0
            w-[66px]
            h-screen
            bg-gray-200/95
            backdrop-blur-md
            shadow-[4px_0_24px_rgba(0,0,0,0.04)]
            border-r border-gray-100
            transition-all duration-300 ease-out
            overflow-visible">

      <nav class="pl-0 pr-0 pt-0 pb-0 text-sm space-y-0">

        <!-- ダッシュボードアイコン -->
        <div>
          <button
            onclick="toggleSubSidebar()"
            class="w-full flex justify-between items-center
                    px-3 py-3
                    hover:text-orange-400
                    hover:bg-orange-50/60
                    hover:shadow-[0_0_0_1px_rgba(251,146,60,0.2)]
                    transition-all duration-200 ease-out group">

            <div class="flex items-center justify-center w-full">
              <svg xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24">
                <circle cx="5" cy="5" r="1.5"/>
                <circle cx="12" cy="5" r="1.5"/>
                <circle cx="19" cy="5" r="1.5"/>
                <circle cx="5" cy="12" r="1.5"/>
                <circle cx="12" cy="12" r="1.5"/>
                <circle cx="19" cy="12" r="1.5"/>
                <circle cx="5" cy="19" r="1.5"/>
                <circle cx="12" cy="19" r="1.5"/>
                <circle cx="19" cy="19" r="1.5"/>
              </svg>
            </div>
          </button>
        </div>

        <div class="py-2"></div>

        <!-- 個人 -->
        <div>
          <div class="relative group">
            <button data-menu="personal" onclick="openSubMenu('personal')"
              class="w-full flex justify-between items-center
                      px-3 py-3
                      hover:text-orange-400
                      hover:bg-orange-50/60
                      hover:shadow-[0_0_0_1px_rgba(251,146,60,0.2)]
                      transition-all duration-200 ease-out group">
              <div class="flex items-center justify-center w-full">
                <svg xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-8 group-hover:text-orange-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0A17.933 17.933 0 0112 21.75a17.933 17.933 0 01-7.5-1.632z"/>
                </svg>
              </div>
            </button>
          </div>
        </div>

        <!-- 企業【個人】 -->
        <div>
          <div class="relative group">
            <button data-menu="individual" onclick="openSubMenu('individual')"
              class="w-full flex justify-between items-center
                    px-3 py-3
                    hover:text-orange-400
                    hover:bg-orange-50/60
                    hover:shadow-[0_0_0_1px_rgba(251,146,60,0.2)]
                    transition-all duration-200 ease-out group">
              <div class="flex items-center justify-center w-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-8 group-hover:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M9 8h6m-6 4h6m-6 4h6M5 21V3h14v18"/>
                </svg>
              </div>
            </button>
          </div>
        </div>

        <!-- 企業【管理者】 -->
        <div>
          <div class="relative group">
            <button data-menu="supervisor" onclick="openSubMenu('supervisor')"
              class="w-full flex justify-between items-center
                      px-3 py-3
                      hover:text-orange-400
                      hover:bg-orange-50/60
                      hover:shadow-[0_0_0_1px_rgba(251,146,60,0.2)]
                      transition-all duration-200 ease-out  group">
              <div class="relative flex items-center justify-center w-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-8 group-hover:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 21h16M7 21V7l5-4 5 4v14M9 10h.01M9 13h.01M9 16h.01M15 10h.01M15 13h.01M15 16h.01"/>
                </svg>
                <span class="absolute
                              top-1
                              right-0
                              bg-red-500
                              text-white
                              text-[10px]
                              w-4
                              h-4
                              rounded-full
                              flex items-center justify-center">
                  10
                </span>
              </div>
            </button>
          </div>
        </div>

        <!-- 企業【システム管理者】 -->
        <div>
          <div class="relative group">
            <button data-menu="administrator" onclick="openSubMenu('administrator')"
              class="w-full flex justify-between items-center
                      px-3 py-3
                      hover:text-orange-400
                      hover:bg-orange-50/60
                      hover:shadow-[0_0_0_1px_rgba(251,146,60,0.2)]
                      transition-all duration-200 ease-out  group">
              <div class="flex items-center justify-center w-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-8 group-hover:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.8"
                        d="M12 4l8 4-8 4-8-4 8-4z"/>
                  <path stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.8"
                        d="M4 12l8 4 8-4"/>
                  <path stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.8"
                        d="M4 16l8 4 8-4"/>
                </svg>
              </div>
            </button>
          </div>
        </div>

      </nav>
    </aside>
    <!-- /Component: Sidebar -->

    <!-- Overlay（モバイル用） -->
    <div id="overlay" onclick="toggleSidebar()"
      class="fixed inset-0 bg-black bg-opacity-50 hidden md:hidden z-40">
    </div>

    <!-- Component: SubSidebar（デフォルト閉じた状態） -->
    <aside id="subSidebar"
      class="fixed z-30 top-14
            left-[66px]
            h-[calc(100vh-56px)]
            bg-white
            overflow-hidden
            transition-all duration-300 ease-out
            sub-sidebar-collapsed">

      <div class="px-4 pt-9 pb-4">
        <h2 id="subSidebarTitle"
            class="font-semibold text-sm text-gray-400">
          メニュー
        </h2>
      </div>

      <div id="subSidebarContent"
            class="font-semibold text-sm">
      </div>
    </aside>
    <!-- /Component: SubSidebar -->
  `;
}

function mountFooter() {
  const placeholder = document.getElementById('app-footer');
  if (!placeholder) return;
  placeholder.outerHTML = `
    <!-- Component: Footer -->
    <footer class="mt-auto bg-white border-t border-gray-200">
      <div class="px-6 py-4
                  flex flex-col md:flex-row
                  items-center justify-between
                  gap-3 text-xs text-gray-500">
        <div class="flex items-center gap-4">
          <a href="#" class="hover:text-orange-400 transition">利用規約</a>
          <span>|</span>
          <a href="#" class="hover:text-orange-400 transition">プライバシーポリシー</a>
          <span>|</span>
          <a href="#" class="hover:text-orange-400 transition">お問い合わせ</a>
        </div>
        <div class="flex items-center gap-2">
          <img src="img/siteicon.png" class="w-8 h-8">
          <span class="text-xs">© 2026 LEON ARTS Inc.</span>
        </div>
      </div>
    </footer>
    <!-- /Component: Footer -->
  `;
}

// ========================================================
// Component: AppSidebarNav
// index.html と共通のメニュー定義／挙動（デフォルトは閉じた状態）
// ========================================================

const menuData = {

  personal: {
    title: "個人",
    items: [
       { section: "パーソナルナレッジ" },
      "プロフィール"
    ]
  },

  individual: {
    title: "企業【個人】",
    items: [
       { section: "パーソナルナレッジ" },
      "プロフィール",
       { section: "目標と実績" },
      "ＭＢＯ一覧",
       { section: "アセスメント" },
      "３６０℃評価"
    ]
  },

  supervisor: {
    title: "企業【管理者】",
    items: [
       { section: "管理業務" },
      "従業員一覧",
      "経歴書一覧",
      "職務経歴一覧",
      "ＭＢＯ一覧",
      "アセスメント一覧",
       { section: "【オプション】組織" },
      "組織ツリー",
      "配属シミュレーション",
      "相性分析",
       { section: "【オプション】エンゲージメント" },
      "パルスサーベイ",
      "ストレスチェック"
    ]
  },

  administrator: {
    title: "企業【システム管理者】",
    items: [
       { section: "締め処理" },
      "年度確定",
       { section: "請求管理" },
      "支払履歴（カード払い）",
       { section: "情報管理" },
      "設定"
    ]
  }

};

// サブメニュー項目 → 作成済みページのリンク先（メニュー種別ごと）
const PAGE_LINKS = {
  "personal:プロフィール": "050_profile.html?c=2",
  "individual:プロフィール": "050_profile.html?c=1",
  "individual:ＭＢＯ一覧": "070_mbo_list.html",
  "supervisor:従業員一覧": "040_user_list.html",
  "supervisor:経歴書一覧": "082_career_document_list.html",
  "supervisor:職務経歴一覧": "084_work_history_list.html",
  "supervisor:ＭＢＯ一覧": "070_mbo_list.html",
  "supervisor:アセスメント一覧": "100_assessment_list.html",
};

// ヘッダー・フッターが共通コンポーネント化済みのページ
// → 同一タブで遷移。未対応のページ → 別タブで開く
const UNIFIED_HEADER_PAGES = new Set([
  "000_new_application.html",
  "010_system_admin_registration.html",
  "040_user_list.html",
  "042_user_registration.html",
  "050_profile.html",
  "060_work_history.html",
  "070_mbo_list.html",
  "072_mbo.html",
  "080_career_document_individual.html",
  "082_career_document_list.html",
  "084_work_history_list.html",
  "090_employee_list.html",
  "100_assessment_list.html",
  "110_360_list.html",
]);

function pageLinkAttrs(href) {
  if (!href || href === "#") return "";
  const file = href.split("?")[0].split("#")[0];
  return UNIFIED_HEADER_PAGES.has(file) ? "" : 'target="_blank" rel="noopener"';
}

let currentMenu = null;

function toggleSidebar() {
  document.getElementById("sidebar")?.classList.toggle("-translate-x-full");
  document.getElementById("overlay")?.classList.toggle("hidden");
}

function toggleUserMenu(event) {
  event.stopPropagation();
  document.getElementById("userMenu")?.classList.toggle("hidden");
}

function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function toggleSubSidebar() {
  const subSidebar = document.getElementById("subSidebar");
  const mainContent = document.getElementById("mainContent");
  if (!subSidebar || !mainContent) return;

  // 閉じる
  if (!subSidebar.classList.contains("sub-sidebar-collapsed")) {
    subSidebar.classList.add("sub-sidebar-collapsed");
    mainContent.style.marginLeft = "78px";
    mainContent.style.width = "calc(100% - 80px)";
    return;
  }

  // 開く
  subSidebar.classList.remove("sub-sidebar-collapsed");
  mainContent.style.marginLeft = "290px";
  mainContent.style.width = "calc(100% - 292px)";
}

function openSubMenu(menu) {

  document.querySelectorAll("[data-menu]").forEach(btn => {
    btn.classList.remove("bg-orange-50", "text-orange-500");
  });

  const subSidebar = document.getElementById("subSidebar");
  const mainContent = document.getElementById("mainContent");
  const subSidebarTitle = document.getElementById("subSidebarTitle");
  const subSidebarContent = document.getElementById("subSidebarContent");
  if (!subSidebar || !mainContent || !subSidebarTitle || !subSidebarContent) return;

  if (currentMenu === menu) {

    currentMenu = null;

    document.querySelector(`[data-menu="${menu}"]`)
      ?.classList.remove("bg-orange-50", "text-orange-500");

    subSidebar.classList.add("sub-sidebar-collapsed");
    mainContent.style.marginLeft = "78px";
    mainContent.style.width = "calc(100% - 80px)";

    return;
  }

  currentMenu = menu;

  document.querySelector(`[data-menu="${menu}"]`)
    ?.classList.add("bg-orange-50", "text-orange-500");

  const data = menuData[menu];
  if (!data) return;

  subSidebarTitle.textContent = data.title;
  subSidebarContent.innerHTML = "";

  data.items.forEach(item => {

    // タイトル行
    if (typeof item === "object" && item.section) {
      subSidebarContent.innerHTML += `
        <div class="px-4 mt-4 mb-2">
          <div class="flex items-center gap-2">
            <span class="
              pl-2
              text-[12px]
              text-gray-400
              tracking-wider
              whitespace-nowrap">
              ${item.section}
            </span>
            <div class="flex-1 h-px bg-gray-200"></div>
          </div>
        </div>
      `;
      return;
    }

    // 通常メニュー
    let clickAction = "";

    switch (item) {

      case "アセスメント":
        clickAction = `onclick="scrollToSection('assessmentSection'); return false;"`;
        break;

      case "ＭＢＯ":
        clickAction = `onclick="scrollToSection('mboSection'); return false;"`;
        break;

      case "経歴":
        clickAction = `onclick="scrollToSection('careerSection'); return false;"`;
        break;

    }

    subSidebarContent.innerHTML += `
      <a href="${PAGE_LINKS[menu + ':' + item] || '#'}"
        ${pageLinkAttrs(PAGE_LINKS[menu + ':' + item])}
        ${clickAction}
        class="
            block
            px-4 py-3
            mx-2 my-1
            rounded-2xl
            hover:bg-orange-50
            hover:text-orange-500
            transition-all">
          ${item}
      </a>
    `;
  });

  subSidebar.classList.remove("sub-sidebar-collapsed");
  mainContent.style.marginLeft = "290px";
  mainContent.style.width = "calc(100% - 292px)";
}

// メニュー外クリックで閉じる
document.addEventListener("click", function () {
  document.getElementById("userMenu")?.classList.add("hidden");
});
