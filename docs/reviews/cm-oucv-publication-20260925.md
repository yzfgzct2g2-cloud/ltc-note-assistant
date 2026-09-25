# 個管 OUCV 功能分支發布檢查

日期：2026-09-25（台灣）
本文件是發布候選的證據說明；是否已發布必須讀取遠端 ref，不以建立 tree／commit 推定。

## 授權與範圍

使用者確認將已驗證修正一般、非強制發布到 codex/case-manager-oucv-v02，完成後通知實機驗證。
只發布已確認的兩個 runtime 變更及其測試、證據、續作說明。不更新 main、GitHub Pages、其他 repo、居督 UI、詞庫內容或正式紀錄語意。

## 來源一致性

- 先前 feature HEAD：94af462c6350511a35ca09640d31380efdeefcfb。
- main 保護基準：df4e3f6d5d3eb4e81c4d042938bb5b8052e0954e。
- 已保存的 local checkpoint：1c30794f8aa73f9c32b453e03ae177f98474f3f8。
- 完整候選 ZIP SHA-256：610dde9e27c5bd62ebf2589ea4c889744f028a0c24e0385a54d44f5fe972445b。
- 已上傳的 source commit：a027ad991df5b406b0b14e78b7a22b6dd1ca8836。
- source tree：57a1a50e2c5db90dde24c6ddca89976176f085cb，與 local checkpoint 整棵 tree 完全一致，包含測試與歷史證據。
- 本文件所在後續 commit 僅更新 CURRENT_STATE、TESTING 及發布說明；runtime bytes 不變。

正常 Git 網路解析仍不可用。使用既有授權 GitHub connector 建立精確 tree／commit，再以 force=false 快轉指定 feature ref。沒有宣稱執行 git push；GitHub 產生的 commit metadata 使 SHA 與原 local commit 不同，原 local history 仍保留在原始候選 ZIP。

## 本輪發布前重驗

- node tests/oucv-loader.test.cjs：PASS，941 records。
- node tests/oucv-official-search.test.cjs：PASS，CM 中英文與 PCS 代碼案例。
- node tests/oucv-ui-static.test.cjs：PASS。
- node --test tests/loader-regression.cjs：4/4 PASS。
- node --check 兩個修改模組：PASS。
- python tests/full_page_integration.py --report ../evidence/full-page.json --golden tests/record-baseline.json：17/17 PASS，54 筆輸出相同。
- git fsck --full、git diff base..HEAD --check：PASS；恢復工作樹乾淨。
- OAES main 新鮮核對為 be97390b7742faf27d061621feb780905b9eabbc；已讀 BOOTSTRAP、Autonomous Execution Profile、DEC-014、DEC-018、DEC-020 及 Security/Privacy/Human Gate。

## 發布時必要核對

讀取指定 feature ref 仍為 94af462… 才可一般快轉；若移動或分歧，停止並保存，不覆蓋其他人的進度。
完成後重新讀取 feature ref、commit tree 及 compare，確認 source commit 是祖先、runtime 只有兩檔差異、main 未變；不變更權限或部署設定。

## 實機驗收界線

受控整頁測試不是正式 HTTP、GitHub Pages、iPhone/Safari E2E。
現階段依 TESTING.md 在電腦 localhost 驗收。沒有產生新的對外手機測試網址，不能將原正式 URL 視為新版。
候選詞彙仍未經逐筆人類專業複核；原生成器的操作指令殘字等問題仍在，已列在 TESTING.md，不以輸出相容性測試掩蓋。

正式網站發布與手機 HTTPS 測試入口需另行核准，不包含在本次功能分支發布。
