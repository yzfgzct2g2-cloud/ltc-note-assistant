# 個管 OUCV 搜尋修正版 v2：實機驗證

本次為功能分支候選，不是正式網站。資料版 OUCV 0.2.0-rc.1；程式批次 cm-oucv-hotfix-v2。

## 先確認測試對象

請用完整候選包或已核對的功能分支，不要使用舊 v0.6 個管居督共用 HTML。
原 GitHub Pages 網址未更新；GitHub 的程式碼瀏覽頁也不是可以操作的新版網站。

## 電腦開啟方式

將測試包解壓縮到新資料夾，不覆蓋現用工具。在含 case-manager 與 shared 子資料夾的位置開啟終端機，以已安裝的 Python 執行：

```sh
python -m http.server 8765 --bind 127.0.0.1
```

Windows 已安裝 Python Launcher 時可用：

```powershell
py -3 -m http.server 8765 --bind 127.0.0.1
```

在同一台電腦的瀏覽器開啟 http://127.0.0.1:8765/case-manager/ 。按 Ctrl+C 停止。
不得只以 file:// 開啟 index.html，因為詞庫 JSON/gzip 需要 HTTP 載入。
這個伺服器只綁定本機回送位址，不供另一支手機連線。不要求停用公司防火牆、管理政策或安裝付費工具。
沒有已安裝 Python 時，此步標示環境待處理，不當成 App 測試失敗。

## 逐項驗證

先在 Windows Chrome 或 Edge 執行一輪；Mac 可使用 Safari。手機 Safari 的正式 HTTPS 網址驗收仍待另行授權的測試站部署，不能使用未更新的舊網址代替。
請只用合成資料，勿貼真實個案姓名、電話、地址或身分證號。

| 編號 | 操作 | 預期 |
|---|---|---|
| T01 | 開啟個管頁、展開下方詞庫 | 有 A～E 五種風格、OUCV 0.2.0-rc.1、「搜尋完整 ICD」；沒有切換成居督的角色選單。 |
| T02 | 輸入「案女表示個案有糖尿病，昨日沒有跌倒，目前不需調整服務。」並生成 | 一至五欄完整；否定敘述留在原紀錄；OUCV 提及提示只代表文字命中，不代表確診或肯定事件。 |
| T03 | 生成有提示的內容後，分別測清除、改字、點另一個範例 | 舊 OUCV 提示立即消失；重新生成後才顯示新內容提示。 |
| T04 | 詞庫分類選全部；分別搜尋「外看」「CVA」「沒飯吃」 | 可找到相符的常用 OUCV 詞彙；限定原分類時有說明，不假稱所有 OUCV 分類均套用。 |
| T05 | 選 CM，搜尋完整 ICD 的「A00」「霍亂」「Cholera」 | 可看到 CM 的 A00 與中英文名稱。 |
| T06 | 選 PCS，搜尋完整 ICD 的「0016070」 | 可看到相同 PCS 代碼與名稱；不得寫入正式紀錄。 |
| T07 | 首次 ICD 搜尋仍在載入時立刻改字或切換 CM／PCS | 舊結果不得蓋掉新查詢；只接受目前查詢結果。 |
| T08 | 比較五種風格，再複製草稿到記事本 | 五種格式皆可讀；貼上內容與選定草稿一致；禁止剪貼簿時有提示，不宣稱已複製。 |
| T09 | 將視窗縮至手機寬度、上下捲動與點按 | 控制項可用，無整頁橫向溢出。此項不等於真實 iPhone 通過。 |

若當下發生詞庫載入失敗，恢復連線後再按一次明確搜尋；預期可以恢復，且失敗期間原紀錄生成仍可用。不需為測試而調整公司網路政策。

## 已知既有問題，不列成本次修正通過

車禍範例在既有生成器中可能留下「一段電訪紀錄，。」之類操作指令殘字。
部分原規則亦可能增加「造成」或聯繫敘述；本次只處理搜尋穩定性，沒有核准或修正這些生成語意。
54 筆基準輸出保持一致只證明本次未引入改動，不代表正式紀錄內容全部正確。
因此目前只供候選驗收；所有生成草稿仍須逐句核對，不直接當成已驗證的正式紀錄。

## 回報格式

```text
測試版本：cm-oucv-hotfix-v2 / OUCV 0.2.0-rc.1
裝置／作業系統：
瀏覽器及版本：
入口：localhost 候選（不要填舊正式站當新版）
測項編號：T01–T09
結果：通過／失敗／未執行
輸入內容（僅合成資料）：
實際畫面或輸出：
截圖：
```

## 自動化重現

```sh
node tests/oucv-loader.test.cjs
node tests/oucv-official-search.test.cjs
node tests/oucv-ui-static.test.cjs
node --test tests/loader-regression.cjs
python tests/full_page_integration.py --report /tmp/oucv-full-page.json --golden tests/record-baseline.json
```

瀏覽器測試依賴既有 Python Playwright 及 /usr/bin/chromium；採完整真實頁面與詞庫、受控傳輸，不替代實際網址／手機驗收。不重建 baseline JSON 掩蓋差異。

## 發布範圍

使用者已授權一般非強制發布至 codex/case-manager-oucv-v02；main、Pages、居督 UI 及其他專案不在此次發布範圍。即時遠端 SHA 以 GitHub ref 查核，不以本說明推定已發布。
