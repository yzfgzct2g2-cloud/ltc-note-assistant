# 個管 OUCV 搜尋整合修正版 v2｜驗證與續作狀態

日期：2026-09-25（台灣）
資料版：OUCV 0.2.0-rc.1（未變更）
程式修正批次：cm-oucv-hotfix-v2

## 本次完成

已將前輪 review-only 補丁套入經雜湊驗證的完整 ltc-note-assistant 來源工作區，並補上整頁測試發現的兩項遺漏。不再只有脫離 App 的元件補丁。

產品變更僅為 shared/oucv-loader.js、case-manager/oucv-ui.js。其餘 15 個既有檔案與基準完全相同；supervisor/**、shared/core.js、case-manager/app.js、941 筆常用詞分包及兩份完整 ICD gzip 均未變動。沒有重新匯入 ICD，亦未變更同義詞審核狀態、醫療推論、QA 規則或正式紀錄生成語意。

五項修正：
1. 清除／編輯輸入後立即隱藏已失效的詞彙提示。
2. 已過期的 ICD 查詢與搜尋類型切換，不讓舊結果覆蓋新狀態。
3. 常用詞／完整 ICD 載入失敗後釋放失敗快取；只有下一次明確操作才重試。
4. 切換跌倒、住院、傷口、照顧、服務等範例時，同步清除前一次詞彙提示。
5. 已過期的常用詞搜尋失敗訊息，不覆蓋後來已清空或更換的查詢狀態。

## 來源與 Git 恢復

Repository：yzfgzct2g2-cloud/ltc-note-assistant。
遠端功能分支：codex/case-manager-oucv-v02。
遠端基準：94af462c6350511a35ca09640d31380efdeefcfb。
原始 tree：0d9c167af279f1830e5f1ccfcd22b356d54d303a。
本機修正分支：codex/case-manager-oucv-validation。
本次沒有 GitHub push、PR、main 合併、Pages 更新或正式部署。

容器 DNS 仍不可用。因此沒有聲稱 git clone 或 git fetch 成功。採用已授權 GitHub connector 的 commit/tree/blob 身分，結合下載產物與已核對文字，恢復精確 Git objects；17/17 個檔案 blob 雜湊、完整 tree 與原始 commit SHA 全部吻合。git fsck --full 通過。基準以淺層邊界標記，保留完整目前來源但未下載更早祖先歷史；不冒稱完整歷史 clone。

已建立隔離 worktree；來源底稿、既有雲端原件與遠端分支不受影響。本機路徑只描述本次執行環境，不代表使用者電腦的 clone。其他電腦的未推送變更與工作狀態無法由本環境確認。

## 測試結果

- 既有常用詞搜尋：PASS，941 records。
- 既有完整 ICD 中文、英文與 PCS 代碼搜尋：PASS。
- 既有 UI 結構檢查：PASS；僅把舊測試硬編碼的失效 /mnt/data 路徑改為 repo 相對路徑。
- 載入器故障／快取回歸：基準 2 PASS、2 FAIL；修正後 4 PASS、0 FAIL。
- 完整頁面整合：基準 9 PASS、8 FAIL；套前輪補丁後 15 PASS、2 FAIL；補齊後 17 PASS、0 FAIL。
- 50 組個管樣本×風格×模式輸出，以及 4 組居督輸出：54/54 與原始基準逐字一致。這是相容性證據，不是對原有生成內容作新的專業正確性背書。
- 整頁測試執行真實個管／居督 HTML、完整 CSS、所有原始 App scripts、四份常用詞 JSON、兩份 ICD gzip；真的執行 gzip 解壓縮。只以受控檔案傳輸替代外部 fetch，並提供腳本來源定位。
- 覆蓋空白啟動、五種風格、清除／修改／範例按鈕、非同步舊結果、類型切換、故障後手動重試、按需載入、成功快取、100 筆上限、文字安全、複製受拒絕時提示、375px 視窗及居督不受影響。
- 本次沒有新增依賴或安裝套件。Node 測試用標準函式庫；瀏覽器測試使用環境原有 Chromium 144.0.7559.96 / Playwright。
- 本次為助理自查與自動化測試，沒有虛構第二位 Agent 或人類專業簽核。

## 仍未完成的驗收與授權

Chromium 管理政策 URLBlocklist=["*"] 禁止網址載入；本輪唯讀確認政策，未修改或繞過限制。測試透過 about:blank 載入完整頁面，並採受控檔案傳輸。因此這是「整頁瀏覽器整合」，不是 HTTP、GitHub Pages、Safari/iPhone、正式網路快取／CORS 或剪貼簿成功操作的端到端驗收。

常用詞仍是候選審核版，ICD 匯入成功不能把俗稱全部變成正式同義詞；源資料對帳沿用前輪已核實紀錄。本次沒有增加醫療／福利資格判斷。原有生成器的規則限制未在這輪改寫。

尚無本次更新 main／Pages 的明確部署授權。較早初始上傳與 history 清理授權不當作無限期正式發布授權。下一步只需確認功能分支發布範圍：正常推送至 codex/case-manager-oucv-v02，不動 main、Pages、居督 UI 或其他專案。

## 固定雲端位置

繼續使用既有 60_OUCV_共用詞彙庫。完整候選工作區放 03_發布模板；報告與證據放 02_來源與審核，不新增根資料夾。候選包非已上線正式版，沒有自動同步到各 consumer。

## OAES

OAES SOURCE VERIFIED：yzfgzct2g2-cloud/Orbikt-AI-Engineering-Standard，main，be97390b7742faf27d061621feb780905b9eabbc。
已重新讀取 BOOTSTRAP.md、AUTONOMOUS_EXECUTION_PROFILE.md、DEC-014、DEC-018、DEC-020，含 Security / Privacy / Human Gate。實際來源 tree 沒有 Project Overlay / AGENTS / CURRENT_STATE；不假稱載入既存 Overlay。本次依使用者明確續作範圍完成本機整合與驗證，未越過遠端發布及 production gate。
Kernel / Runtime / emergency access 未觸發。沒有使用真實個案、沒有新 AI/STT、主機、金鑰或付費服務。
