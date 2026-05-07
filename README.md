# 🌀 Ceiling Fan Card — Home Assistant

כרטיס Lovelace מעוצב לשליטה במאוורר תקרה עם **6 מצבי מהירות**, אנימציית להבים חיה ונתוני סל"ד / צריכת חשמל / זרימת אוויר.

![preview](https://img.shields.io/badge/HA-Lovelace%20Card-blue?style=flat-square&logo=home-assistant)
![version](https://img.shields.io/badge/version-1.0.0-green?style=flat-square)
![hacs](https://img.shields.io/badge/HACS-Custom-orange?style=flat-square)

---

## התקנה דרך HACS (מומלץ)

1. פתח **HACS** → **Frontend**
2. לחץ על תפריט שלוש הנקודות ← **Custom repositories**
3. הכנס את כתובת ה-repo הזה ← בחר Category: **Lovelace**
4. לחץ **Download**
5. רענן חזק את הדפדפן (`Ctrl + Shift + R`)

---

## התקנה ידנית

1. הורד את `ceiling-fan-card.js`
2. העתק לתיקייה `/config/www/ceiling-fan-card.js`
3. Settings → Dashboards → Resources → ➕ הוסף:
   ```
   URL:  /local/ceiling-fan-card.js
   Type: JavaScript Module
   ```
4. רענן חזק את הדפדפן

---

## שימוש

```yaml
type: custom:ceiling-fan-card
entity: fan.my_ceiling_fan
```

### אפשרויות

| שדה | סוג | ברירת מחדל | תיאור |
|-----|-----|------------|-------|
| `entity` | string | **חובה** | ישות מאוורר ב-HA (fan.*) |
| `name` | string | friendly_name | שם מותאם אישית |
| `speed_count` | number | `6` | מספר מצבי מהירות (1–6) |

### דוגמאות

```yaml
# בסיסי
type: custom:ceiling-fan-card
entity: fan.living_room_fan

# עם כל האפשרויות
type: custom:ceiling-fan-card
entity: fan.bedroom_fan
name: מאוורר חדר שינה
speed_count: 6
```

---

## דרישות

- Home Assistant 2023.x ומעלה
- ישות מאוורר עם תמיכה ב-`percentage` (סטנדרטי ב-HA)
- חיבור אינטרנט (לטעינת פונטים מ-Google Fonts)

---

## רישיון

MIT © 2025
