export const DISCORD_NAME = "OpenAI Student Collective at UAlberta";
export const DISCORD_AVATAR_URL = "https://openai-student-collective-ualberta.vercel.app/collective-logo.png";
export type EmbedField = { name:string; value:string; inline:boolean };
export type EmbedDraft = { title:string; description:string; url:string; color:string; authorName:string; authorUrl:string; authorIcon:string; thumbnail:string; image:string; footer:string; footerIcon:string; timestamp:boolean; fields:EmbedField[] };
export type DiscordDraft = { mode:"message"|"embed"; content:string; embed:EmbedDraft };
export function emptyDiscordDraft():DiscordDraft { return {mode:"message",content:"",embed:{title:"",description:"",url:"",color:"#a995d6",authorName:"",authorUrl:"",authorIcon:"",thumbnail:"",image:"",footer:"",footerIcon:"",timestamp:false,fields:[]}}; }
export type DiscordEmbed = { title?:string; description?:string; url?:string; color:number; author?:{name:string;url?:string;icon_url?:string}; thumbnail?:{url:string};image?:{url:string};footer?:{text:string;icon_url?:string};timestamp?:string;fields?:EmbedField[] };
export type DiscordMessagePayload = {username:string;avatar_url:string;allowed_mentions:{parse:string[]};content?:string;embeds?:DiscordEmbed[]};
export class DiscordValidationError extends Error {}
function invalid(message:string):never {throw new DiscordValidationError(message);}
function record(v:unknown):Record<string,unknown> {if(!v||typeof v!=="object"||Array.isArray(v))return invalid("Invalid message.");return v as Record<string,unknown>;}
function text(v:unknown,label:string,max:number):string {if(v===undefined||v===null)return "";if(typeof v!=="string")return invalid(`Check ${label}.`);const s=v.trim();if(s.length>max)return invalid(`${label} exceeds ${max.toLocaleString()} characters.`);return s;}
export function optionalDiscordUrl(value:unknown):string|undefined {const s=text(value,"URL",2048);if(!s)return undefined;let u:URL;try{u=new URL(s);}catch{return invalid("Enter a valid HTTP or HTTPS URL.");}if(!["https:","http:"].includes(u.protocol)||u.username||u.password||/[\u0000-\u0020\u007f]/.test(s))return invalid("Enter a valid HTTP or HTTPS URL.");return u.href;}
export function validateDiscordWebhookUrl(value:unknown):string {const s=text(value,"Webhook URL",2048);let u:URL;try{u=new URL(s);}catch{return invalid("Enter a valid Discord webhook URL.");}if(u.protocol!=="https:"||!["discord.com","discordapp.com"].includes(u.hostname)||u.username||u.password||u.port||u.search||u.hash||!/^\/api(?:\/v10)?\/webhooks\/[0-9]+\/[A-Za-z0-9._-]+$/.test(u.pathname)||/[\u0000-\u0020\u007f]/.test(s))return invalid("Enter a valid Discord webhook URL.");return u.href;}
export function discordWebhookRequestUrl(value:unknown):string {const u=new URL(validateDiscordWebhookUrl(value));u.searchParams.set("wait","true");return u.href;}
export function normalizeDiscordMessage(value:unknown, now=new Date().toISOString()):DiscordMessagePayload {
 const d=record(value);const base={username:DISCORD_NAME,avatar_url:DISCORD_AVATAR_URL,allowed_mentions:{parse:[] as string[]}};
 if(d.mode==="message") {const content=text(d.content,"Message",2000);if(!content)invalid("Write a message first.");return {...base,content};}
 if(d.mode!=="embed")return invalid("Choose Message or Embed.");
 const e=record(d.embed);const title=text(e.title,"Title",256),description=text(e.description,"Description",4096),authorName=text(e.authorName,"Author name",256),footer=text(e.footer,"Footer",2048);
 const color=text(e.color,"Colour",7)||"#a995d6";if(!/^#[a-fA-F0-9]{6}$/.test(color))invalid("Use a six-digit hex colour, such as #a995d6.");
 const url=optionalDiscordUrl(e.url),authorUrl=optionalDiscordUrl(e.authorUrl),authorIcon=optionalDiscordUrl(e.authorIcon),thumbnail=optionalDiscordUrl(e.thumbnail),image=optionalDiscordUrl(e.image),footerIcon=optionalDiscordUrl(e.footerIcon);
 if((authorUrl||authorIcon)&&!authorName)invalid("Add an author name to use an author link or icon.");if(footerIcon&&!footer)invalid("Add footer text to use a footer icon.");
 if(!Array.isArray(e.fields)||e.fields.length>25)invalid("Use up to 25 embed fields.");
 const fields=(e.fields as unknown[]).map(v=>{const f=record(v),name=text(f.name,"Field name",256),value=text(f.value,"Field value",1024);if(!name||!value)invalid("Each field needs a name and value.");if(typeof f.inline!=="boolean")invalid("Invalid field layout.");return {name,value,inline:f.inline as boolean};});
 const total=title.length+description.length+authorName.length+footer.length+fields.reduce((n,f)=>n+f.name.length+f.value.length,0);if(total>6000)invalid("An embed can contain up to 6,000 text characters in total.");
 if(!title&&!description&&!fields.length&&!image&&!thumbnail&&!authorName&&!footer)invalid("Add content to your embed first.");
 if(typeof e.timestamp!=="boolean")invalid("Invalid timestamp setting.");
 const embed:DiscordEmbed={color:parseInt(color.slice(1),16),...(title?{title}:{}),...(description?{description}:{}),...(url?{url}:{}),...(authorName?{author:{name:authorName,...(authorUrl?{url:authorUrl}:{}),...(authorIcon?{icon_url:authorIcon}:{})}}:{}),...(thumbnail?{thumbnail:{url:thumbnail}}:{}),...(image?{image:{url:image}}:{}),...(footer?{footer:{text:footer,...(footerIcon?{icon_url:footerIcon}:{})}}:{}),...(e.timestamp?{timestamp:now}:{}),...(fields.length?{fields}:{})};
 return {...base,embeds:[embed]};
}
