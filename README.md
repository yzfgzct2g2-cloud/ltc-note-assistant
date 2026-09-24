# 長照紀錄助理（LTC Note Assistant）

單一 GitHub repository、兩個真正獨立的前端 App。

## 正式入口

- 個案管理員  
  https://yzfgzct2g2-cloud.github.io/ltc-note-assistant/case-manager/

- 居家服務督導員  
  https://yzfgzct2g2-cloud.github.io/ltc-note-assistant/supervisor/

- 入口首頁  
  https://yzfgzct2g2-cloud.github.io/ltc-note-assistant/

## 架構

```
/
├─ index.html
├─ case-manager/
│  ├─ index.html
│  └─ app.js
├─ supervisor/
│  ├─ index.html
│  └─ app.js
└─ shared/
   ├─ core.js
   └─ styles.css
```

### shared/
只放兩種角色都可共用的底層能力：
- 長照自然語意概念與同義詞
- 否定／不確定語氣
- 急性安全提醒
- 跨議題組合
- 日期、關係稱謂與追蹤建議

### case-manager/
個管專屬：
- FA310 型輸出
- A～E 去識別化 Style Profile
- 照顧計畫異動欄位
- 個管專屬追蹤格式

### supervisor/
居督專屬：
- 居服員回報
- 排班／代班
- 服務異常
- 服務界線
- 居督已執行處理與後續欄位
- 居督專屬語意資料

兩個 App 不互相載入彼此的角色資料，因此後續可以各自累積、各自更新；共用語意核心修正時則兩邊同步受益。

## 隱私

本專案為純前端靜態頁面；目前不含 API、外部分析工具或後端儲存。使用者輸入內容不會由此程式主動上傳。正式紀錄仍須由工作人員確認後使用。
