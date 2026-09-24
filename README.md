# 長照紀錄助理（LTC Note Assistant）

單一 GitHub Pages、雙角色入口的長照紀錄 Prototype。

## 入口

- 居家服務督導員  
  https://yzfgzct2g2-cloud.github.io/ltc-note-assistant/?role=supervisor

- 個案管理員  
  https://yzfgzct2g2-cloud.github.io/ltc-note-assistant/?role=case-manager

兩個入口實際共用同一份 `index.html`，因此語意詞庫、QA、安全規則與功能修正只需維護一次。

## 目前版本

Prototype v0.6

- 個管：保留五位 Style Profile
- 居督：採共通中性實務紀錄風格
- 共用長照語意詞庫
- 否定／不確定語意辨識
- 跨議題延伸
- 追蹤建議與詢問話術
- 正式紀錄與推論建議分離

## GitHub Pages

此 repository 目前使用根目錄 `index.html`，建議 Pages 設定為：

- Source: Deploy from a branch
- Branch: `main`
- Folder: `/ (root)`

## 使用注意

本工具為紀錄輔助 Prototype。正式紀錄仍應由工作人員確認事實、日期、人物、服務內容與處理結果後再使用。