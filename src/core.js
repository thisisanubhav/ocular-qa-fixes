export function escapeHTML(value='') {
  return String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export function inquiryURL(subject) {
  return `/contact?${new URLSearchParams({subject})}`;
}
export function inquirySubject(search) {
  return (new URLSearchParams(search).get('subject') || '').trim().slice(0,1000);
}
export function paginate(items,language='All',page=1,query='',pageSize=6) {
  const filtered=items.filter(d=>(language==='All'||d.language===language)&&`${d.name} ${d.countries}`.toLowerCase().includes(query.toLowerCase().trim()));
  const pages=Math.max(1,Math.ceil(filtered.length/pageSize));
  const current=Math.min(Math.max(1,Number.isFinite(Number(page))?Math.floor(Number(page)):1),pages);
  return {items:filtered.slice((current-1)*pageSize,current*pageSize),total:filtered.length,pages,page:current};
}
export function rankModels(models,metric,access='All',query='') {
  return models.filter(m=>(access==='All'||modelAccess(m)===access)&&m.name.toLowerCase().includes(query.toLowerCase()))
    .toSorted((a,b)=>metric==='Speaker Count'?b.scores[metric]-a.scores[metric]:a.scores[metric]-b.scores[metric]);
}
export function modelAccess(model) {
  return /Pyannote|DiariZen|Nemotron|Parakeet|Qwen|Cohere/.test(model.name)?'Open Source':'Proprietary';
}
export function contactPayload(formData) {
  const fields=['firstName','lastName','email','phone','jobTitle','company','companyWebsite','companyType','subject','dataVolume','message','otherInterest','otherUseCase'];
  const payload=Object.fromEntries(fields.map(key=>[key,String(formData.get(key)||'').trim()]));
  return {...payload,interests:formData.getAll('interests').map(String),useCases:formData.getAll('useCases').map(String)};
}
export function validateContact(payload) {
  const errors={};
  for(const key of ['firstName','lastName','email','jobTitle','company','companyType']) if(!payload[key]?.trim())errors[key]='This field is required.';
  if(payload.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))errors.email='Enter a valid email address.';
  if(!payload.interests?.length)errors.interests='Select at least one interest.';
  if(payload.interests?.includes('Other')&&!payload.otherInterest?.trim())errors.otherInterest='Please describe your interest.';
  if(payload.useCases?.includes('Other')&&!payload.otherUseCase?.trim())errors.otherUseCase='Please describe your use case.';
  return errors;
}
