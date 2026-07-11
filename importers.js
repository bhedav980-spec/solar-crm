const clean=s=>(s||'').replace(/\u00a0/g,' ').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();
const num=s=>Number(String(s||'').replace(/[^0-9.\-]/g,''))||0;
const first=(text,patterns)=>{for(const p of patterns){const m=text.match(p);if(m&&m[1])return clean(m[1]);}return ''};
async function pdfText(file){
  const buf=await file.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data:buf}).promise;
  let out='';
  for(let i=1;i<=pdf.numPages;i++){
    const page=await pdf.getPage(i); const tc=await page.getTextContent();
    out+='\n'+tc.items.map(x=>x.str).join(' ');
  }
  return clean(out);
}
async function ocrFile(file){
  let source=file;
  if(file.type==='application/pdf'){
    const pdf=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise;
    const page=await pdf.getPage(1); const vp=page.getViewport({scale:2});
    const c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;
    await page.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;
    source=c;
  }
  const r=await Tesseract.recognize(source,'eng',{logger:m=>window.dispatchEvent(new CustomEvent('ocr-progress',{detail:m}))});
  return clean(r.data.text);
}
async function readFile(file){
  let text='';
  try{
    if(file.type==='application/pdf'||/\.pdf$/i.test(file.name)) text=await pdfText(file);
    else if(/\.(png|jpe?g|webp)$/i.test(file.name)) text=await ocrFile(file);
    else if(/\.docx$/i.test(file.name)&&window.mammoth){text=clean((await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()})).value);}
  }catch(e){console.warn('Text read failed',file.name,e)}
  if(text.replace(/\s/g,'').length<35 && (/\.pdf$/i.test(file.name)||/\.(png|jpe?g|webp)$/i.test(file.name))){
    try{text=await ocrFile(file)}catch(e){console.warn('OCR failed',file.name,e)}
  }
  return text;
}
function classify(name,text){const s=(name+' '+text).toLowerCase();
  if(s.includes('aadhaar')||s.includes('government of india')&&/\d{4}\s?\d{4}\s?\d{4}/.test(s))return 'Aadhaar Card';
  if(s.includes('income tax')||s.includes('permanent account number'))return 'PAN Card';
  if(s.includes('passbook')||s.includes('ifsc')||s.includes('account no'))return 'Bank Passbook';
  if(s.includes('electricity bill')||s.includes('consumer no')&&s.includes('pgvcl'))return 'Electricity Bill';
  if(s.includes('acknowledgement for submission')||s.includes('application reference number'))return 'Solar Application Acknowledgement';
  if(s.includes('approval of feasibility'))return 'PGVCL Feasibility Report';
  if(s.includes('net metering agreement'))return 'Net Metering Agreement';
  if(s.includes('vendor feasibility'))return 'Vendor Feasibility Report';
  if(s.includes('quotation'))return 'Quotation';
  if(s.includes('agreement between consumer'))return 'Work Agreement';
  if(s.includes('e token')||s.includes('e-token'))return 'E-Token';
  if(s.includes('property')||s.includes('gharvera'))return 'Property Proof';
  if(/sign|signature/i.test(name))return 'Signature';
  if(/roof|site/i.test(name))return 'Site Photo';
  return 'Other Document';}
function extractCustomer(records){
  const all=clean(records.map(r=>r.text).join('\n'));
  const upper=all.toUpperCase();
  let name=first(all,[/Name of Applicant\s*[:\-]?\s*([A-Z][A-Z ]{4,60}?)(?=\s+(?:Mobile|Date|Consumer|\d))/i,/Sh\/Smt\s+([A-Z][A-Z ]{4,60}?)(?=\s+Date)/i,/Name\s*[:\-]\s*(?:MR\.?\s*)?([A-Z][A-Z ]{4,60}?)(?=\s+(?:Address|DOB|Date|Customer))/i]);
  const mobile=first(all,[/Mobile No\.?\s*[:\-]?\s*(\d{10})/i,/\bM[- ]?(\d{10})\b/i,/\b(\d{10})\b/]);
  const consumer=first(all,[/Consumer (?:Account )?Number(?: in Discom)?\s*[:\-]?\s*(\d{8,15})/i,/Consumer No\.?\s*[:\-]?\s*(\d{8,15})/i]);
  const application=first(all,[/(NP-[A-Z0-9-]{8,30})/i]);
  const pan=first(upper,[/\b([A-Z]{5}[0-9]{4}[A-Z])\b/]);
  const ifsc=first(upper,[/\b([A-Z]{4}0[A-Z0-9]{6})\b/]);
  const account=first(all,[/(?:A\/C|Account|SB Account)\s*(?:No\.?|Number)?\s*[:\-]?\s*([0-9]{8,20})/i]);
  const bank=first(all,[/\b(IDBI BANK|HDFC BANK|STATE BANK OF INDIA|BANK OF BARODA|ICICI BANK|AXIS BANK|PUNJAB NATIONAL BANK)\b/i]);
  const load=first(all,[/(?:Sanctioned Load|Contract Demand\/Sanctioned Load)[^0-9]{0,30}([0-9.]+)\s*kW/i]);
  const capacity=first(all,[/(?:Applied (?:Roof Top Solar )?Capacity|Applied Capacity)[^0-9]{0,30}([0-9.]+)\s*kWp?/i]);
  let address=first(all,[/Address of Premises for Installation\s*[:\-]?\s*(.+?)(?=\s+(?:District|3\.|State:|PIN Code))/is,/Address\s*[:\-]\s*(.+?)(?=\s+(?:Customer|Date|Nomination|IFSC))/is]);
  if(!address) address=first(all,[/having premises at\s+(.+?)\s+and Consumer No/is]);
  const aadhaar=first(all,[/\b(\d{4}\s?\d{4}\s?\d{4})\b/]).replace(/\s/g,'');
  return {name,mobile,consumer_no:consumer,application_no:application,address,district:/KACHCHH|KUTCH/i.test(all)?'Kachchh':'',discom:/PGVCL|Paschim Gujarat/i.test(all)?'PGVCL':'',sanctioned_load:num(load),capacity_kw:num(capacity),pan,aadhaar_last4:aadhaar.slice(-4),bank_name:bank,account_last4:account.slice(-4),ifsc};
}
async function parseCustomerFiles(files,onStatus){const records=[];for(let i=0;i<files.length;i++){onStatus?.(`Reading ${i+1}/${files.length}: ${files[i].name}`);const text=await readFile(files[i]);records.push({file:files[i],text,type:classify(files[i].name,text)});}return {fields:extractCustomer(records),records};}
function parseDate(s){const m=s.match(/(\d{1,2})[-\/]([A-Za-z]{3}|\d{1,2})[-\/](\d{2,4})/);if(!m)return'';const mons={jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'};let mm=mons[m[2].toLowerCase()]||String(m[2]).padStart(2,'0');let yy=m[3].length===2?'20'+m[3]:m[3];return `${yy}-${mm}-${String(m[1]).padStart(2,'0')}`}
function parsePurchaseText(text){
  const invoice_no=first(text,[/Invoice No\.?[^A-Z0-9]*(COM\/[0-9-]+\/[0-9]+)/i,/\b([A-Z]{2,10}\/[0-9-]+\/[0-9]+)\b/]);
  const supplier=first(text,[/^\s*([A-Z][A-Z &.]{5,80}(?:LLP|LIMITED|PVT LTD|PRIVATE LIMITED))/m]);
  const invoice_date=parseDate(first(text,[/Dated\s+(\d{1,2}[-\/][A-Za-z]{3}[-\/]\d{2,4})/i,/Ack Date\s*:\s*(\d{1,2}[-\/][A-Za-z]{3}[-\/]\d{2,4})/i]));
  const cgst=num(first(text,[/CGST[^0-9]{0,30}([0-9,]+\.\d{2})/i])); const sgst=num(first(text,[/SGST[^0-9]{0,30}([0-9,]+\.\d{2})/i]));
  const total=num(first(text,[/Total\s+\d+\s+NOS\s+[^0-9]*([0-9,]+\.\d{2})/i,/Grand Total[^0-9]*([0-9,]+\.\d{2})/i]));
  const items=[]; const normalized=text.replace(/\s+/g,' ');
  const re=/(WAAREE|ADANI|PAHAL|APS|POLYCAB|VSOLE)?\s*([A-Z0-9][A-Z0-9 ()+\-\/]{3,60}?)\s+(\d{6,8})\s+(\d+(?:\.\d+)?)\s+(NOS|NO|PCS|SET|MTR|KG)\s+([0-9,]+(?:\.\d+)?)\s+(?:NOS|NO|PCS|SET|MTR|KG)\s+([0-9,]+(?:\.\d+)?)/gi;
  let m;while((m=re.exec(normalized))){items.push({brand:clean(m[1]||''),name:clean(m[2]),hsn:m[3],qty:num(m[4]),unit:m[5],rate:num(m[6]),amount:num(m[7]),model:(m[2].match(/\b\d{3,4}W\b/i)||[''])[0]});}
  if(!items.length){const panel=/((?:WAAREE|ADANI|PAHAL|APS)[^0-9]{0,20}\d{3,4}\s*DCR\s*PANEL)\s+\d{8}\s+(\d+)\s+NOS\s+([0-9,]+\.\d{2})\s+NOS\s+([0-9,]+\.\d{2})/gi;while((m=panel.exec(normalized)))items.push({brand:(m[1].match(/WAAREE|ADANI|PAHAL|APS/i)||[''])[0],name:'Solar Panel',model:(m[1].match(/\d{3,4}\s*DCR/i)||[''])[0],hsn:'85414300',qty:num(m[2]),unit:'Nos',rate:num(m[3]),amount:num(m[4])});}
  return {supplier,invoice_no,invoice_date,cgst,sgst,total,items};
}
async function parsePurchaseFile(file,onStatus){onStatus?.('Reading purchase invoice...');const text=await readFile(file);return {...parsePurchaseText(text),text,file};}
window.CRMImporters={parseCustomerFiles,parsePurchaseFile};
