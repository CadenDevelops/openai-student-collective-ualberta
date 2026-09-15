import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyDiscordDraft,normalizeDiscordMessage,validateDiscordWebhookUrl,discordWebhookRequestUrl,DISCORD_AVATAR_URL} from '../src/lib/discord';
test('webhook URLs cannot reach arbitrary hosts or redirect paths',()=>{
 for(const u of ['http://discord.com/api/webhooks/1/token','https://localhost/api/webhooks/1/token','https://discord.com.evil.test/api/webhooks/1/token','https://discord.com/api/webhooks/1/token?x=1','https://user:pass@discord.com/api/webhooks/1/token','https://discord.com/api/webhooks/1/token/slack'])assert.throws(()=>validateDiscordWebhookUrl(u));
 assert.equal(discordWebhookRequestUrl('https://discord.com/api/webhooks/123/token'),'https://discord.com/api/webhooks/123/token?wait=true');
});
test('regular messages use fixed identity and disable mentions',()=>{
 const p=normalizeDiscordMessage({...emptyDiscordDraft(),content:'Hello @everyone',avatar_url:'https://evil.test'});assert.equal(p.content,'Hello @everyone');assert.equal(p.avatar_url,DISCORD_AVATAR_URL);assert.deepEqual(p.allowed_mentions,{parse:[]});assert.equal(p.embeds,undefined);
 assert.throws(()=>normalizeDiscordMessage({...emptyDiscordDraft(),content:'x'.repeat(2001)}));
});
test('embed editor validates all Discord limits and links',()=>{
 const d=emptyDiscordDraft();d.mode='embed';d.embed.title='Event';d.embed.description='Details';d.embed.fields=[{name:'When',value:'TBA',inline:true}];d.embed.footer='UAlberta';d.embed.timestamp=true;
 const p=normalizeDiscordMessage(d,'2026-09-15T00:00:00.000Z');assert.equal(p.embeds?.[0].fields?.[0].inline,true);assert.equal(p.embeds?.[0].timestamp,'2026-09-15T00:00:00.000Z');
 assert.throws(()=>normalizeDiscordMessage({...d,embed:{...d.embed,image:'javascript:alert(1)'}}));
 assert.throws(()=>normalizeDiscordMessage({...d,embed:{...d.embed,fields:Array(26).fill({name:'a',value:'b',inline:false})}}));
 assert.throws(()=>normalizeDiscordMessage({...d,embed:{...d.embed,description:'x'.repeat(4096),footer:'y'.repeat(2048)}}));
 assert.throws(()=>normalizeDiscordMessage({...d,embed:{...d.embed,authorIcon:'https://example.com/icon.png'}}));
});
