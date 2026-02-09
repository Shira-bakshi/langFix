// content.js - סקריפט שרץ בעמוד וטוען את המילון
// טעינת המילון מ-dictionary.js

// פונקציה לחיפוש עמוק בתוך Elements בחיפוש טקסט שנבחר
function findSelectedTextInElement(element) {
  const selection = window.getSelection();
  if (selection.toString().trim() !== "") {
    return selection.toString();
  }
  
  // חיפוש בתוך contenteditable elements
  const editables = document.querySelectorAll('[contenteditable="true"]');
  for (let editable of editables) {
    const range = editable.ownerDocument.getSelection();
    if (range && range.toString().trim() !== "") {
      return range.toString();
    }
  }
  
  return null;
}

// מאזין להודעות מה-background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fixSelected") {
    const selection = window.getSelection();
    let selectedText = selection.toString();
    const activeElement = document.activeElement;
    
    // אם window.getSelection() לא עובד, נחפש בעמוד
    if (!selectedText || selectedText.trim().length === 0) {
      selectedText = findSelectedTextInElement(activeElement);
    }
    
    if (!selectedText || selectedText.trim().length === 0) {
      alert("בחר טקסט קודם!");
      return;
    }

    try {
      // תיקון הטקסט
      const fixedText = fixTheWord(selectedText);
      
      // **מקרה 1: input או textarea fields**
      if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
        const startPos = activeElement.selectionStart;
        const endPos = activeElement.selectionEnd;
        
        if (startPos !== undefined && endPos !== undefined) {
          const before = activeElement.value.substring(0, startPos);
          const after = activeElement.value.substring(endPos);
          activeElement.value = before + fixedText + after;
          
          // הצבת ה-cursor אחרי הטקסט החדש
          activeElement.selectionStart = activeElement.selectionEnd = startPos + fixedText.length;
          activeElement.focus();
          
          console.log("✅ הטקסט התוקן בהצלחה ב-input/textarea");
          return;
        }
      }
      
      // **מקרה 2: contenteditable elements (Gmail, צ'אט וכו')**
      // בדוק את activeElement ואת כל contenteditable elements בעמוד
      let editableElement = activeElement && activeElement.contentEditable === "true" ? activeElement : null;
      
      if (!editableElement) {
        // חיפוש בכל contenteditable elements
        const editables = document.querySelectorAll('[contenteditable="true"]');
        for (let editable of editables) {
          const range = editable.ownerDocument.getSelection();
          if (range && range.toString().trim() !== "") {
            editableElement = editable;
            break;
          }
        }
      }
      
      if (editableElement && editableElement.contentEditable === "true") {
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          const textNode = document.createTextNode(fixedText);
          range.insertNode(textNode);
          
          // הצבת ה-cursor אחרי הטקסט החדש
          const newRange = document.createRange();
          newRange.setStart(textNode, fixedText.length);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
          
          console.log("✅ הטקסט התוקן בהצלחה ב-contenteditable");
          return;
        }
      }
      
      // **מקרה 3: בחירה רגילה בעמוד (DOM)**
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(fixedText);
        range.insertNode(textNode);
        
        // הצבת ה-cursor אחרי הטקסט החדש
        const newRange = document.createRange();
        newRange.setStart(textNode, fixedText.length);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        console.log("✅ הטקסט התוקן בהצלחה");
      }
    } catch (error) {
      console.error("❌ שגיאה:", error);
    }
  }
});
