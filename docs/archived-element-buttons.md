# ปุ่มเลือกธาตุที่ถอดออก

วันที่ 14 ตุลาคม 2026 ถอดปุ่ม 甲 ไม้, 丙 ไฟ, 庚 ทอง, 壬 น้ำ ออกจากหน้าหลัก เพราะแตะอักษรกลางวงเพื่อวนธาตุได้แล้ว เก็บชิ้นส่วนเดิมไว้ในเอกสารนี้เพื่อเรียกกลับมาใช้งาน ข้อมูลธาตุใน core.mjs และการสลับกลางวงยังใช้งานตามเดิม

## วิธีนำกลับมา

1. แทรก HTML ด้านล่างใน index.html หลังแถวฤดูกาล ก่อน rotation-controls
2. ใส่บรรทัดสร้างปุ่มใน renderControls() ของ app.mjs หลังการตั้ง --green
3. ใส่ตัวรับการคลิกหลัง cycleCenterProfile() โดยตัวรับนี้ตั้งค่า profile และเรียก alignProfile() เหมือนเดิม
4. เพิ่ม CSS ใน style.css ตรวจการคลิกทั้งสี่ปุ่มและการแตะกลางวง แล้วเปลี่ยนเลขเวอร์ชันไฟล์ใน index.html ก่อนเผยแพร่

ไม่ควรย้อนทั้ง commit เพราะจะกระทบการปรับแต่งอื่นที่เกิดขึ้นภายหลัง

## HTML

```html
<div id="profiles" class="profile-grid" aria-label="เลือกก้านฟ้าหยาง"></div>
```

## สร้างปุ่มใน renderControls()

```javascript
$('profiles').innerHTML=Object.entries(profiles).map(([key,p])=>`<button data-profile="${key}" class="${key===profile?'active':''}" style="--accent:${p.color}" aria-label="${p.han} ${p.reading} ${p.name}" aria-pressed="${key===profile}"><span class="han">${p.han}</span><span>${({wood:"ไม้",fire:"ไฟ",metal:"ทอง",water:"น้ำ"})[key]}<small>${p.reading}</small></span></button>`).join('');
```

## ตัวรับการคลิก

```javascript
$('profiles').addEventListener('click',e=>{const button=e.target.closest('[data-profile]');if(!button)return;profile=button.dataset.profile;alignProfile();$('profiles').querySelector(`[data-profile="${profile}"]`).focus({preventScroll:true});});
```

## CSS

```css
.profile-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:0 6px 16px}
.profile-grid button{padding:8px 4px;display:flex;align-items:center;justify-content:center;gap:8px;background:#fbfaf6;border:1px solid var(--line);border-radius:12px;font-size:12px}
.profile-grid button.active{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,#fbfaf6)}
.profile-grid .han{font-family:'Noto Sans TC',serif;font-size:26px;color:var(--accent)}
.profile-grid small{display:block;color:var(--muted);font-size:10px}
.settings-section .profile-grid{margin:0 0 10px}
@media(min-width:720px){.profile-grid{margin-top:0}.profile-grid button{padding:12px 6px;font-size:14px}.profile-grid .han{font-size:30px}}
@media(max-width:360px){.profile-grid{gap:5px;margin-left:0;margin-right:0}.profile-grid button{gap:5px;font-size:11px}.profile-grid .han{font-size:22px}}
```
