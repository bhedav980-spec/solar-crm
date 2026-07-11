(function () {
  const U = "https://bsvxqhxyexhbgysnfgal.supabase.co";
  const K = "sb_publishable_yg-F8bDfTJEZPAHr38TwJw_Yue23cpg";
  const TK = "rs_supabase_access_token";
  const OWNER = "a0994734-0a44-4bad-8204-68469d916b33";
  const clean = v => String(v || "").replace(/\s+/g, " ").trim();
  const first = (s, patterns) => {
    for (const r of patterns) { const m = s.match(r); if (m && m[1]) return clean(m[1]); }
    return "";
  };
  const category = name => {
    if (/aadhar|aadhaar/i.test(name)) return "Aadhaar";
    if (/pan/i.test(name)) return "PAN";
    if (/bank|passbook/i.test(name)) return "Bank Passbook";
    if (/light|electric|bill/i.test(name)) return "Electricity Bill";
    if (/roof/i.test(name)) return "Roof Photo";
    if (/sign/i.test(name)) return "Signature";
    if (/quotation|quote/i.test(name)) return "Quotation";
    if (/feasib/i.test(name)) return "Feasibility Report";
    if (/net.?meter/i.test(name)) return "Net Metering Agreement";
    if (/work.?agreement/i.test(name)) return "Work Agreement";
    if (/token/i.test(name)) return "E-Token";
    if (/gharvera|property/i.test(name)) return "Property Receipt";
    if (/apk|akn|acknow/i.test(name)) return "Application Acknowledgement";
    return "Other";
  };
  async function ocrCanvas(canvas) {
    const result = await Tesseract.recognize(canvas, "eng", { logger: m => setStatus(m.status === "recognizing text" ? `OCR ${Math.round((m.progress || 0) * 100)}%` : m.status) });
    return result.data.text || "";
  }
  async function readPdf(file) {
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    let out = "";
    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p), tc = await page.getTextContent();
      let pageText = tc.items.map(x => x.str).join(" ");
      if (clean(pageText).length < 80) {
        const viewport = page.getViewport({ scale: 2.2 }), canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
        pageText = await ocrCanvas(canvas);
      }
      out += `\n${pageText}`;
    }
    return out;
  }
  async function readFile(file) {
    if (/pdf/i.test(file.type) || /\.pdf$/i.test(file.name)) return readPdf(file);
    if (/\.docx$/i.test(file.name)) return (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
    if (/image/i.test(file.type)) return (await Tesseract.recognize(file, "eng", { logger: m => setStatus(m.status) })).data.text || "";
    return "";
  }
  function extract(docs) {
    const all = docs.map(d => d.text).join("\n");
    const bill = docs.find(d => d.category === "Electricity Bill")?.text || "";
    const aadhaar = docs.find(d => d.category === "Aadhaar")?.text || "";
    const panDoc = docs.find(d => d.category === "PAN")?.text || "";
    const bank = docs.find(d => d.category === "Bank Passbook")?.text || "";
    const official = docs.filter(d => /Acknowledgement|Feasibility|E-Token/.test(d.category)).map(d => d.text).join("\n");
    const applications = [...all.matchAll(/NP-GJ(?:PG|P)\d{2}-\d{8}/gi)].map(m => m[0].toUpperCase());
    const uniqueApps = [...new Set(applications)];
    const name = first(official + "\n" + bill + "\n" + panDoc + "\n" + aadhaar, [
      /Name of Applicant\s*[:\-]?\s*([A-Z][A-Z ]{5,}?)(?=\s+(?:Mobile|Date|Application|\d))/i,
      /Beneficiary Details\s*Name\s*:\s*([A-Z][A-Z ]+)/i,
      /(?:SDO Name[^\n]*\n)?\s*([A-Z]{2,}(?:\s+[A-Z]{2,}){2,})\s+(?:Census|AKARNI|Village)/i,
      /(?:Name\s*)\n?\s*([A-Z]{2,}(?:\s+[A-Z]{2,}){2,})/i,
      /Chad\s+Bhadresh\s+Lakhman/i
    ]) || (/(Chad\s+Bhadresh\s+Lakhman)/i.test(all) ? "CHAD BHADRESH LAKHMAN" : "");
    const address = first(bill + "\n" + aadhaar + "\n" + official, [
      /([A-Z0-9\/-]+\s+KOLI\s+VAAS\s+NOKHANIYA[^\n]*)/i,
      /Address\s*:\s*([^\n]+(?:\n[^\n]+){0,2})/i,
      /ADDRESS OF PREMISES INSTALLATION\s*[:\-]?\s*([^\n]+)/i,
      /premises at\s+([^\n]+)/i
    ]);
    const uniquePhones = [...new Set([...(official + "\n" + bill).matchAll(/\b([6-9]\d{9})\b/g)].map(m => m[1]))];
    const phone = first(official + "\n" + bill, [/(?:Mobile No\.?)\s*[:\-]?\s*(\d{10})/i, /(?:M-)\s*(\d{10})/i, /\b([6-9]\d{9})\b/]);
    const consumerNo = first(bill + "\n" + official, [/(?:Consumer (?:Account )?(?:Number|No\.?)[^\d]*)(\d{8,15})/i]);
    const kw = first(official + "\n" + all, [/(?:Applied Capacity|Applied Roof Top Solar Capacity|Generating System of|SUBJECT:)\D*(\d+(?:\.\d+)?)\s*kW/i]);
    const pan = first(panDoc, [/\b([A-Z]{5}\d{4}[A-Z])\b/]);
    const aadhaarNo = first(aadhaar, [/\b(\d{4}\s+\d{4}\s+\d{4})\b/]);
    const dob = first(panDoc + "\n" + aadhaar, [/(?:Date of Birth|DOB)\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{4})/i]);
    const ifsc = first(bank, [/\b([A-Z]{4}0[A-Z0-9]{6})\b/i]);
    const accountNo = first(bank, [/(?:SB Account No\.?|A\/c No\.?)\s*[:\-]?\s*([A-Z0-9]+)/i]);
    const cleanAddress = address.replace(/\s+(?:Feeder Code|Route Code|Census Code).*$/i, "").trim();
    const warnings = [];
    if (uniqueApps.length > 1) warnings.push(`Application number mismatch: ${uniqueApps.join(" / ")}`);
    if (uniquePhones.length > 1) warnings.push(`Mobile number mismatch: ${uniquePhones.join(" / ")}`);
    return { name, phone, address: cleanAddress, village: /nokhaniya/i.test(address + all) ? "Nokhaniya" : "", taluka: /bhuj/i.test(address + all) ? "Bhuj" : "", district: "Kutch", state: "Gujarat", discom: "PGVCL", type: "Residential", consumerNo, applicationNo: uniqueApps[0] || "", kw, pan, aadhaarNo, dob, ifsc, accountNo, docs, warnings };
  }
  let statusEl;
  function setStatus(t) { if (statusEl) statusEl.textContent = clean(t); }
  function field(label, key, value) { return `<label><span>${label}</span><input data-key="${key}" value="${String(value || "").replace(/&/g,"&amp;").replace(/"/g,"&quot;")}"></label>`; }
  function preview(data) {
    const overlay = document.createElement("div"); overlay.className = "import-overlay";
    overlay.innerHTML = `<div class="import-card"><h2>Review Customer Details</h2><p class="hint">Document se nikli har detail check/edit karke hi save karein.</p>${data.warnings.map(w=>`<div class="warn">⚠ ${w}</div>`).join("")}<div class="import-grid">${field("Customer Name *","name",data.name)}${field("Mobile *","phone",data.phone)}${field("Consumer No.","consumerNo",data.consumerNo)}${field("Application No.","applicationNo",data.applicationNo)}${field("Plant Capacity kW","kw",data.kw)}${field("PAN","pan",data.pan)}${field("Aadhaar No.","aadhaarNo",data.aadhaarNo)}${field("DOB","dob",data.dob)}${field("Village","village",data.village)}${field("Taluka","taluka",data.taluka)}${field("District","district",data.district)}${field("IFSC","ifsc",data.ifsc)}${field("Bank Account","accountNo",data.accountNo)}<label class="full"><span>Installation Address</span><textarea data-key="address">${data.address || ""}</textarea></label></div><h3>Documents (${data.docs.length})</h3><div class="doc-list">${data.docs.map(d=>`<div><b>${d.category}</b><span>${d.file.name}</span><em>${d.text ? "Read" : "Stored only"}</em></div>`).join("")}</div><div class="actions"><button data-cancel>Cancel</button><button class="primary" data-save>Confirm & Create</button></div><div class="save-status"></div></div>`;
    document.body.appendChild(overlay);
    overlay.querySelector("[data-cancel]").onclick=()=>overlay.remove();
    overlay.querySelector("[data-save]").onclick=async()=>{overlay.querySelectorAll("[data-key]").forEach(x=>data[x.dataset.key]=clean(x.value));if(!data.name||!data.phone)return alert("Name aur mobile required hai.");const st=overlay.querySelector(".save-status");st.textContent="Uploading private documents...";try{await save(data);st.textContent="Customer successfully created.";setTimeout(()=>location.reload(),700)}catch(e){st.textContent="Error: "+e.message}};
  }
  async function save(d) {
    const token=window.getSupabaseToken?await window.getSupabaseToken():localStorage.getItem(TK); if(!token) throw new Error("Login expired. Dobara login karein.");
    const id="C"+Date.now(), stored=[];
    for(const doc of d.docs){const safe=doc.file.name.replace(/[^a-z0-9._-]/gi,"_");const path=`${id}/${Date.now()}-${safe}`;const r=await fetch(`${U}/storage/v1/object/customer-documents/${path}`,{method:"POST",headers:{apikey:K,Authorization:`Bearer ${token}`,"x-upsert":"false","Content-Type":doc.file.type||"application/octet-stream"},body:doc.file});if(!r.ok)throw new Error(`${doc.file.name} upload failed`);stored.push({name:doc.file.name,category:doc.category,path,type:doc.file.type,size:doc.file.size})}
    const r=await fetch(`${U}/rest/v1/crm_state?id=eq.main&select=data`,{headers:{apikey:K,Authorization:`Bearer ${token}`}});if(!r.ok)throw new Error("CRM data load failed");const rows=await r.json(),data=rows[0]?.data||{};data.customers=data.customers||[];
    if(d.consumerNo&&data.customers.some(c=>c.consumerNo===d.consumerNo))throw new Error("Is consumer number ka customer pehle se hai.");
    data.customers.unshift({id,name:d.name,phone:d.phone,email:"",address:d.address,village:d.village,taluka:d.taluka,district:d.district,state:d.state,discom:d.discom,type:d.type,consumerNo:d.consumerNo,applicationNo:d.applicationNo,pan:d.pan,aadhaarNo:d.aadhaarNo,dob:d.dob,ifsc:d.ifsc,accountNo:d.accountNo,documents:stored,createdAt:new Date().toISOString().slice(0,10),createdBy:"u1"});
    if(d.kw){data.projects=data.projects||[];data.projects.unshift({id:"PR"+Date.now(),customerId:id,kw:Number(d.kw),scheme:"PM Surya Ghar Muft Bijli Yojana",status:"Documentation",applicationNo:d.applicationNo,createdAt:new Date().toISOString().slice(0,10),dealStatus:"Accepted"})}
    const wr=await fetch(`${U}/rest/v1/crm_state?on_conflict=id`,{method:"POST",headers:{apikey:K,Authorization:`Bearer ${token}`,"Content-Type":"application/json",Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({id:"main",data,owner_id:OWNER,updated_at:new Date().toISOString()})});if(!wr.ok)throw new Error("Customer save failed");
  }
  async function run(files){statusEl=document.querySelector(".import-progress");const docs=[];for(let i=0;i<files.length;i++){const kind=category(files[i].name);setStatus(`Reading ${i+1}/${files.length}: ${files[i].name}`);let t="";try{if(!/Roof Photo|Signature/.test(kind))t=await readFile(files[i])}catch(e){console.error(e)}docs.push({file:files[i],category:kind,text:t})}setStatus("");preview(extract(docs))}
  addEventListener("load",()=>{const style=document.createElement("style");style.textContent=`.import-overlay{position:fixed;inset:0;background:#0009;z-index:20000;display:flex;align-items:flex-start;justify-content:center;padding:3vh 12px;overflow:auto}.import-card{background:#fff;width:min(900px,100%);border-radius:16px;padding:24px;color:#1a1a2e}.import-card h2{margin:0}.hint{color:#64748b}.warn{background:#fff7ed;color:#c2410c;padding:10px;border-radius:8px;margin:8px 0}.import-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.import-grid label{display:flex;flex-direction:column;gap:5px;font-size:12px;font-weight:700}.import-grid input,.import-grid textarea{padding:10px;border:1px solid #cbd5e1;border-radius:8px;font:inherit}.import-grid .full{grid-column:1/-1}.doc-list>div{display:grid;grid-template-columns:160px 1fr 80px;gap:8px;padding:8px;border-bottom:1px solid #eee;font-size:12px}.doc-list em{color:#16a34a}.actions{display:flex;justify-content:flex-end;gap:10px;margin-top:18px}.actions button{padding:10px 16px;border-radius:8px;border:1px solid #ccc}.actions .primary{background:#2563eb;color:#fff;border:0}.save-status{margin-top:8px;color:#2563eb}.import-progress{position:fixed;right:22px;bottom:132px;z-index:10000;background:#fff;padding:8px;border-radius:7px;font-size:11px;max-width:280px}@media(max-width:650px){.import-grid{grid-template-columns:1fr}.import-grid .full{grid-column:auto}}`;document.head.appendChild(style);const b=document.createElement("button"),i=document.createElement("input"),p=document.createElement("div");b.textContent="📁 Import Customer Folder";b.style="position:fixed;right:22px;bottom:22px;z-index:9999;padding:13px 18px;border:0;border-radius:10px;background:#2563eb;color:white;font-weight:700;cursor:pointer;box-shadow:0 8px 24px #0003";i.type="file";i.multiple=true;i.webkitdirectory=true;i.hidden=true;p.className="import-progress";i.onchange=()=>i.files.length&&run([...i.files]);b.onclick=()=>i.click();document.body.append(i,b,p)})
})();
