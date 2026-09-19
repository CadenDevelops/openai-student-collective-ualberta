"use client";
import { useEffect, useState } from "react";
import type { FormDefinition } from "@/lib/forms";
import { siteUrl } from "@/content/collective";
import { emptyDiscordDraft, normalizeDiscordMessage, DISCORD_NAME, type EmbedDraft, type DiscordEmbed, type DiscordMessagePayload } from "@/lib/discord";

const site=siteUrl;
async function request(method:string,data?:unknown) {
 const response=await fetch('/api/discord',{method,headers:{'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined});
 const result=await response.json();if(!response.ok)throw new Error(result.error||'Could not complete the request.');return result;
}
function Input({label,value,onChange,max=2048,type='text',placeholder}:{label:string;value:string;onChange:(v:string)=>void;max?:number;type?:string;placeholder?:string}) {
 return <label>{label}<input type={type} value={value} onChange={e=>onChange(e.target.value)} maxLength={max} placeholder={placeholder}/></label>;
}
export function DiscordPanel({forms}:{forms:FormDefinition[]}) {
 const [configured,setConfigured]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[webhook,setWebhook]=useState('');
 const [draft,setDraft]=useState(emptyDiscordDraft),[source,setSource]=useState(''),[sent,setSent]=useState('');
 useEffect(()=>{let active=true;request('GET').then(d=>{if(active)setConfigured(d.configured);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 function patch(p:Partial<EmbedDraft>){setDraft(d=>({...d,embed:{...d.embed,...p}}));setNotice('');}
 async function save(e:React.FormEvent){e.preventDefault();setBusy('save');setError('');setNotice('');try{const d=await request('POST',{action:'save',url:webhook.trim()});setWebhook('');setConfigured(true);setNotice(d.branded?'Webhook saved, and given the collective’s name and logo in Discord.':'Webhook saved. Discord would not accept the profile picture, so the webhook keeps its own; messages still carry the logo.');setSent('');}catch(e){setError((e as Error).message);}finally{setBusy('');}}
 async function brand(){setBusy('brand');setError('');setNotice('');try{await request('POST',{action:'brand'});setNotice('Discord updated: the webhook now uses the collective’s name and logo.');}catch(e){setError((e as Error).message);}finally{setBusy('');}}
 async function disconnect(){if(!window.confirm('Disconnect this webhook from the dashboard? This will not delete it from Discord.'))return;setBusy('disconnect');setError('');setNotice('');try{await request('DELETE');setConfigured(false);setNotice('Webhook disconnected.');}catch(e){setError((e as Error).message);}finally{setBusy('');}}
 async function send(e:React.FormEvent){e.preventDefault();if(busy)return;setBusy('send');setError('');setNotice('');try{await request('POST',{action:'send',...draft});setSent(JSON.stringify(draft));setNotice('Sent to Discord.');}catch(e){setError((e as Error).message);}finally{setBusy('');}}
 function chooseForm(id:string){setSource(id);const f=forms.find(f=>f.id===id);if(!f)return;setDraft(d=>({...d,content:`${f.title}\n\n${f.description}\n\n${site}/f/${f.id}`,embed:{...d.embed,title:f.title,description:f.description,url:`${site}/f/${f.id}`}}));setNotice('');}
 let payload:DiscordMessagePayload|undefined;let validation='';try{payload=normalizeDiscordMessage(draft);}catch(e){validation=(e as Error).message;}
 const alreadySent=sent===JSON.stringify(draft);
 const total=draft.embed.title.length+draft.embed.description.length+draft.embed.authorName.length+draft.embed.footer.length+draft.embed.fields.reduce((n,f)=>n+f.name.length+f.value.length,0);
 const hasContent=draft.mode==='message'?Boolean(draft.content):Boolean(total||draft.embed.image||draft.embed.thumbnail);
 let preview=payload;
 if(!preview&&draft.mode==='embed'){try{preview=normalizeDiscordMessage({...draft,embed:{...draft.embed,fields:draft.embed.fields.filter(f=>f.name.trim()&&f.value.trim())}});}catch{/* Invalid links and over-limit content are not rendered. */}}
 const e=draft.embed;
 return <div className="discord-workspace">
  <div className="page-heading"><div><h1>Discord</h1><p className="muted">Write a message. See it before you send.</p></div><span className={`discord-connection ${configured?'connected':''}`}>{loading?'Checking connection':configured?'Webhook connected':'Not connected'}</span></div>
  {error&&<p className="error" role="alert">{error}</p>}{notice&&<p className="notice" role="status">{notice}</p>}
  <details className="discord-settings panel" open={!loading&&!configured}><summary>Webhook settings <span>{configured?'Manage connection':'Connect a channel'}</span></summary><div className="discord-settings-body">
   <p className="small muted">Discord → Edit Channel → Integrations → Webhooks → Copy Webhook URL. Use a text-channel webhook.</p>
   <form onSubmit={save}><label>Webhook URL<input type="password" autoComplete="off" spellCheck={false} placeholder="https://discord.com/api/webhooks/…" required value={webhook} onChange={ev=>setWebhook(ev.target.value)} disabled={!!busy}/></label><div className="actions"><button className="action" disabled={!!busy||loading}>{busy==='save'?'Saving':'Save webhook'}</button>{configured&&<button type="button" className="action" onClick={brand} disabled={!!busy}>{busy==='brand'?'Updating':'Reapply name and logo'}</button>}{configured&&<button type="button" className="text-button" onClick={disconnect} disabled={!!busy}>Disconnect</button>}</div></form><p className="small muted">Stored privately. The saved URL is never returned to the browser. Connecting a webhook also sets its name and picture in Discord to the collective’s.</p>
  </div></details>
  <div className="discord-mode" role="group" aria-label="Message type">{(['message','embed'] as const).map(mode=><button key={mode} aria-pressed={draft.mode===mode} disabled={!!busy} onClick={()=>{setDraft(d=>({...d,mode}));setNotice('');}}>{mode==='message'?'Message':'Embed'}</button>)}</div>
  <div className="discord-compose-grid">
   <form className="discord-composer" onSubmit={send}><fieldset disabled={!!busy||loading} className="editor-lock">
    <label>Share a form <span className="muted">(optional)</span><select value={source} onChange={ev=>chooseForm(ev.target.value)}><option value="">Start with a blank message</option>{forms.filter(f=>f.status==='published').map(f=><option value={f.id} key={f.id}>{f.title}</option>)}</select></label>
    {draft.mode==='message'?<><label>Message<textarea rows={10} value={draft.content} maxLength={2000} placeholder="What would you like to share?" onChange={ev=>{setDraft(d=>({...d,content:ev.target.value}));setNotice('');}}/></label><div className="discord-character-count">{draft.content.length.toLocaleString()} / 2,000</div></>:<>
     <Input label="Title" value={e.title} onChange={v=>patch({title:v})} max={256} placeholder="Event name or announcement"/>
     <label>Description<textarea rows={6} value={e.description} maxLength={4096} onChange={ev=>patch({description:ev.target.value})} placeholder="Add the details."/></label>
     <div className="embed-link-color"><Input label="Title link" type="url" value={e.url} onChange={v=>patch({url:v})} placeholder="https://"/><label className="embed-colour">Accent colour<input type="color" value={e.color} onChange={ev=>patch({color:ev.target.value})}/></label></div>
     <details className="embed-options"><summary>Author</summary><Input label="Author name" value={e.authorName} onChange={v=>patch({authorName:v})} max={256}/><Input label="Author link" type="url" value={e.authorUrl} onChange={v=>patch({authorUrl:v})}/><Input label="Author icon URL" type="url" value={e.authorIcon} onChange={v=>patch({authorIcon:v})}/></details>
     <details className="embed-options"><summary>Images</summary><Input label="Thumbnail URL" type="url" value={e.thumbnail} onChange={v=>patch({thumbnail:v})}/><Input label="Large image URL" type="url" value={e.image} onChange={v=>patch({image:v})}/></details>
     <details className="embed-options"><summary>Fields <span>{e.fields.length} / 25</span></summary>{e.fields.map((f,i)=><div className="embed-field-editor" key={i}><Input label={`Field ${i+1} name`} value={f.name} max={256} onChange={v=>patch({fields:e.fields.map((x,n)=>n===i?{...x,name:v}:x)})}/><label>Field {i+1} value<textarea rows={2} maxLength={1024} value={f.value} onChange={ev=>patch({fields:e.fields.map((x,n)=>n===i?{...x,value:ev.target.value}:x)})}/></label><div className="embed-field-actions"><label className="inline-check"><input type="checkbox" checked={f.inline} onChange={ev=>patch({fields:e.fields.map((x,n)=>n===i?{...x,inline:ev.target.checked}:x)})}/>Inline</label><div className="actions"><button type="button" aria-label={`Move field ${i+1} up`} disabled={i===0} onClick={()=>{const fields=[...e.fields];[fields[i-1],fields[i]]=[fields[i],fields[i-1]];patch({fields});}}>↑</button><button type="button" aria-label={`Move field ${i+1} down`} disabled={i===e.fields.length-1} onClick={()=>{const fields=[...e.fields];[fields[i+1],fields[i]]=[fields[i],fields[i+1]];patch({fields});}}>↓</button><button type="button" onClick={()=>patch({fields:e.fields.filter((_,n)=>n!==i)})} aria-label={`Remove field ${i+1}`}>Remove</button></div></div></div>)}<button type="button" className="action" disabled={e.fields.length>=25} onClick={()=>patch({fields:[...e.fields,{name:'',value:'',inline:false}]})}>Add field</button></details>
     <details className="embed-options"><summary>Footer & timestamp</summary><Input label="Footer text" value={e.footer} max={2048} onChange={v=>patch({footer:v})}/><Input label="Footer icon URL" type="url" value={e.footerIcon} onChange={v=>patch({footerIcon:v})}/><label className="inline-check"><input type="checkbox" checked={e.timestamp} onChange={ev=>patch({timestamp:ev.target.checked})}/>Include send time</label></details>
     <div className="discord-character-count embed-total">{total.toLocaleString()} / 6,000 total characters</div>
    </>}
    {hasContent&&validation&&<p className="small muted" role="status">{validation}</p>}
    <div className="discord-send-row"><span className="small muted">{configured?'Posts to the connected channel.':'Connect a webhook to send.'}</span><button className="action primary" disabled={!configured||!payload||alreadySent}>{busy==='send'?'Sending':alreadySent?'Sent':'Send to Discord'} <span aria-hidden="true">↗</span></button></div>
   </fieldset></form>
   <aside className="discord-preview-column" aria-label="Message preview"><div className="discord-section-title"><h2>Preview</h2></div>
    <div className="discord-preview"><div className="discord-preview-header"><img className="discord-preview-avatar" src="/collective-logo.png" width="40" height="40" alt=""/><div><strong>{DISCORD_NAME}</strong><span className="discord-app-badge">APP</span><small>Today</small></div></div>
     {draft.mode==='message'?<p className="discord-plain-preview">{draft.content.trim()||'Your message will appear here.'}</p>:preview?.embeds?.[0]?<EmbedPreview embed={preview.embeds[0]}/>:<div className="discord-empty-preview">Your embed will appear here.</div>}
    </div><p className="small muted discord-preview-note">Discord may render Markdown and links differently. Mentions won’t notify anyone.</p>
   </aside>
  </div>
 </div>;
}
function EmbedPreview({embed:e}:{embed:DiscordEmbed}) {return <div className="discord-embed" style={{borderLeftColor:`#${e.color.toString(16).padStart(6,'0')}`}}>
 {e.thumbnail&&<img className="embed-thumbnail" src={e.thumbnail.url} alt="Embed thumbnail"/>}
 {e.author&&<div className="embed-author">{e.author.icon_url&&<img src={e.author.icon_url} alt=""/>}{e.author.url?<a href={e.author.url} target="_blank" rel="noreferrer">{e.author.name}</a>:e.author.name}</div>}
 {e.title&&(e.url?<a href={e.url} className="discord-embed-title" target="_blank" rel="noreferrer">{e.title}</a>:<h3 className="discord-embed-title">{e.title}</h3>)}
 {e.description&&<p>{e.description}</p>}
 {e.fields&&<div className="embed-preview-fields">{e.fields.map((f,i)=><div key={i} className={f.inline?'inline':''}><strong>{f.name}</strong><p>{f.value}</p></div>)}</div>}
 {e.image&&<img className="embed-large-image" src={e.image.url} alt="Embed image"/>}
 {(e.footer||e.timestamp)&&<div className="embed-footer">{e.footer?.icon_url&&<img src={e.footer.icon_url} alt=""/>}<span>{e.footer?.text}{e.footer&&e.timestamp?' · ':''}{e.timestamp?new Date(e.timestamp).toLocaleString(undefined,{dateStyle:'short',timeStyle:'short'}):''}</span></div>}
 </div>;}
