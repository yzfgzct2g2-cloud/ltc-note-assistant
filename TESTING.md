# 候選測試工作區

此為完整來源的候選修正版，不是正式網站部署。資料版 OUCV 0.2.0-rc.1，程式批次 cm-oucv-hotfix-v2。

## 開啟個管工具

在本資料夾以已安裝的 Python 執行：

```sh
python -m http.server 8765 --bind 127.0.0.1
```

用瀏覽器開啟 http://127.0.0.1:8765/case-manager/ 。按 Ctrl+C 關閉本機伺服器。不可只用 file:// 開啟 index.html，JSON/gzip 載入需要可運作的本機 HTTP 環境。這個指令不部署正式站、不主動上傳輸入。

## 可重現測試

Node.js：

```sh
node tests/oucv-loader.test.cjs
node tests/oucv-official-search.test.cjs
node tests/oucv-ui-static.test.cjs
node --test tests/loader-regression.cjs
```

瀏覽器測試需既有 Python Playwright 及 Chromium；此環境的預設執行檔為 /usr/bin/chromium。

```sh
python tests/full_page_integration.py --report /tmp/oucv-full-page.json --golden tests/record-baseline.json
```

此測試載入完整頁面與真實靜態資料，但使用受控傳輸，不能代替實際網址／手機驗收。不要重建 baseline JSON 掩蓋差異；它來自未修改的 94af462… 原始版本。

## Git 與續作

隨包的 Git metadata 是可攜的淺層工作區；以 94af462… 為基準保留本次本機修正提交。origin 只含公開 repository URL，沒有 token。資料夾名稱不是身分依據；續作時核對 origin、HEAD、工作樹及遠端分支。未授權前不推送 main 或功能分支。

以 CURRENT_STATE.md 和 docs/reviews/cm-oucv-integration-20260925.md 為續作入口。正式網站尚未更新；居督維持原版本。
